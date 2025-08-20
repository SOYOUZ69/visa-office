'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paymentsAPI, metaAPI, servicesAPI, dossiersAPI } from '@/lib/api';
import { Payment, PaymentOption, PaymentModality, CreatePaymentData, ServiceItem, InstallmentStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Save, Trash2, Calculator, CreditCard, Edit, CheckCircle, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { mutate } from 'swr';
import useSWR from 'swr';

// Validation Schema
const PaymentInstallmentSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  percentage: z.number().min(0.01, 'Percentage must be greater than 0').max(100, 'Percentage cannot exceed 100'),
  amount: z.number().min(0, 'Amount must be at least 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentOption: z.enum(['BANK_TRANSFER', 'CHEQUE', 'POST', 'CASH'] as const).optional(),
  transferCode: z.string().optional(),
  status: z.enum(['PENDING', 'PAID'] as const).optional(),
});

const PaymentFormSchema = z.object({
  paymentOption: z.enum(['BANK_TRANSFER', 'CHEQUE', 'POST', 'CASH'] as const).optional(),
  paymentModality: z.enum(['FULL_PAYMENT', 'SIXTY_FORTY', 'MILESTONE_PAYMENTS'] as const),
  transferCode: z.string().optional(),
  installments: z.array(PaymentInstallmentSchema).min(1, 'At least one installment is required'),
}).refine((data) => {
  // Validate that percentages sum to 100%
  const totalPercentage = data.installments.reduce((sum, installment) => sum + installment.percentage, 0);
  return Math.abs(totalPercentage - 100) < 0.01;
}, {
  message: 'Installment percentages must sum to exactly 100%',
  path: ['installments'],
}).refine((data) => {
  // For FULL_PAYMENT, global paymentOption is required
  if (data.paymentModality === 'FULL_PAYMENT') {
    return !!data.paymentOption;
  }
  // For other modalities, each installment must have a paymentOption
  if (data.paymentModality === 'SIXTY_FORTY' || data.paymentModality === 'MILESTONE_PAYMENTS') {
    return data.installments.every(installment => !!installment.paymentOption);
  }
  return true;
}, {
  message: 'Payment option is required',
  path: ['paymentOption'],
});

type PaymentFormData = z.infer<typeof PaymentFormSchema>;

interface PaymentSectionProps {
  clientId?: string;
  dossierId?: string;
  dossierStatus?: string;
  isNewClient?: boolean;
}

export function PaymentSection({ clientId, dossierId, dossierStatus, isNewClient = false }: PaymentSectionProps) {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentModalities, setPaymentModalities] = useState<PaymentModality[]>([]);
  const [saving, setSaving] = useState(false);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [numberOfInstallments, setNumberOfInstallments] = useState(2);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const { user } = useAuth();

  // Use SWR to load payments for this dossier
  const { data: payments = [], isLoading: paymentsLoading } = useSWR(
    dossierId ? `/dossiers/${dossierId}/payments` : null,
    () => dossierId ? paymentsAPI.getDossierPayments(dossierId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  // Use SWR to load services for this dossier 
  const { data: services = [] } = useSWR(
    dossierId ? `/dossiers/${dossierId}/services` : null,
    () => dossierId ? servicesAPI.getDossierServices(dossierId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  // Helper function to invalidate relevant caches
  const invalidateRelatedCaches = () => {
    if (dossierId && clientId) {
      // Invalidate dossier payments cache
      mutate(`/dossiers/${dossierId}/payments`);
      // Invalidate dossier services cache 
      mutate(`/dossiers/${dossierId}/services`);
      // Invalidate dossiers list cache (for counters)
      mutate(`/dossiers/${clientId}`);
      // Also invalidate by ID for good measure
      mutate(`/dossier/${dossierId}`);
    }
  };

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      paymentOption: 'CASH',
      paymentModality: 'FULL_PAYMENT',
      transferCode: '',
      installments: [
        {
          description: 'Full Payment',
          percentage: 100,
          amount: 0,
          dueDate: '',
          status: 'PENDING',
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'installments',
  });

  const isAdmin = user?.role === 'ADMIN';
  const watchedPaymentOption = form.watch('paymentOption');
  const watchedPaymentModality = form.watch('paymentModality');
  const watchedInstallments = form.watch('installments');

  // Determine if we should show configuration form or payment history
  const shouldShowConfigForm = isNewClient || payments.length === 0 || isEditing;
  const currentPayment = editingPaymentId ? payments.find(p => p.id === editingPaymentId) : null;

  useEffect(() => {
    // Load meta data (options and modalities) only once
    const loadMetaData = async () => {
      try {
        const [optionsData, modalitiesData] = await Promise.all([
          metaAPI.getPaymentOptions(),
          metaAPI.getPaymentModalities(),
        ]);
        setPaymentOptions(optionsData);
        setPaymentModalities(modalitiesData);
      } catch (error) {
        console.error('Failed to load payment metadata:', error);
        toast.error('Failed to load payment options');
      }
    };

    loadMetaData();
  }, []);

  // Reset form when dossier changes (Bug B fix)
  useEffect(() => {
    if (dossierId) {
      form.reset({
        paymentOption: 'CASH',
        paymentModality: 'FULL_PAYMENT',
        transferCode: '',
        installments: [
          {
            description: 'Full Payment',
            percentage: 100,
            amount: 0,
            dueDate: '',
            status: 'PENDING',
          },
        ],
      });
      setIsEditing(false);
      setEditingPaymentId(null);
      setNumberOfInstallments(2);
    }
  }, [dossierId, form]);

  // Calculate services total when services change
  useEffect(() => {
    const total = services.reduce((sum, service) => {
      return sum + (service.quantity * parseFloat(service.unitPrice));
    }, 0);
    setServicesTotal(total);
  }, [services]);

  // Update installment amounts when total or percentages change (only when not editing existing payment)
  useEffect(() => {
    // Don't auto-update amounts when editing an existing payment initially
    if (isEditing && editingPaymentId) {
      return;
    }

    const updatedInstallments = watchedInstallments.map(installment => {
      const percentage = typeof installment.percentage === 'string' 
        ? parseFloat(installment.percentage) || 0 
        : installment.percentage || 0;
      
      return {
        ...installment,
        percentage, // Ensure percentage is a number
        amount: (servicesTotal * percentage) / 100,
      };
    });
    
    // Only update if amounts have changed to avoid infinite loops
    const hasChanged = updatedInstallments.some((updated, index) => {
      const currentAmount = typeof watchedInstallments[index]?.amount === 'string' 
        ? parseFloat(watchedInstallments[index].amount) || 0 
        : watchedInstallments[index]?.amount || 0;
      return Math.abs(updated.amount - currentAmount) > 0.01;
    });
    
    if (hasChanged) {
      form.setValue('installments', updatedInstallments);
    }
  }, [servicesTotal, form, isEditing, editingPaymentId]); // Remove watchedInstallments from dependencies to avoid infinite loops

  // Handle payment modality changes (only when not editing existing payment)
  useEffect(() => {
    // Don't auto-replace fields when editing an existing payment
    if (isEditing && editingPaymentId) {
      return;
    }
    
    switch (watchedPaymentModality) {
      case 'FULL_PAYMENT':
        replace([{
          description: 'Full Payment',
          percentage: 100,
          amount: servicesTotal,
          dueDate: '',
          status: 'PENDING',
        }]);
        break;
      case 'SIXTY_FORTY':
        replace([
          {
            description: 'First Payment - 60%',
            percentage: 60,
            amount: servicesTotal * 0.6,
            dueDate: '',
            paymentOption: 'CASH',
            transferCode: '',
            status: 'PENDING',
          },
          {
            description: 'Second Payment - 40%',
            percentage: 40,
            amount: servicesTotal * 0.4,
            dueDate: '',
            paymentOption: 'CASH',
            transferCode: '',
            status: 'PENDING',
          },
        ]);
        break;
      case 'MILESTONE_PAYMENTS':
        // Keep existing installments or create default ones
        if (fields.length === 0) {
          const defaultPercentage = 100 / numberOfInstallments;
          const defaultInstallments = Array.from({ length: numberOfInstallments }, (_, index) => ({
            description: `Installment ${index + 1}`,
            percentage: defaultPercentage,
            amount: (servicesTotal * defaultPercentage) / 100,
            dueDate: '',
            paymentOption: 'CASH',
            transferCode: '',
            status: 'PENDING',
          }));
          replace(defaultInstallments);
        }
        break;
    }
  }, [watchedPaymentModality, servicesTotal, numberOfInstallments, replace, fields.length, isEditing, editingPaymentId]);

  const loadData = async () => {
    try {
      if (dossierId) {
        // Load data from the specific dossier
        const [paymentsData, servicesData, optionsData, modalitiesData] = await Promise.all([
          paymentsAPI.getDossierPayments(dossierId),
          servicesAPI.getDossierServices(dossierId),
          metaAPI.getPaymentOptions(),
          metaAPI.getPaymentModalities(),
        ]);
        
        setPayments(paymentsData);
        setServices(servicesData);
        setPaymentOptions(optionsData);
        setPaymentModalities(modalitiesData);
      } else {
        // Only load meta data if no dossier is selected
        const [optionsData, modalitiesData] = await Promise.all([
          metaAPI.getPaymentOptions(),
          metaAPI.getPaymentModalities(),
        ]);
        
        setPayments([]);
        setServices([]);
        setPaymentOptions(optionsData);
        setPaymentModalities(modalitiesData);
      }
    } catch (error) {
      console.error('Failed to load payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const loadMetaData = async () => {
    try {
      const [optionsData, modalitiesData] = await Promise.all([
        metaAPI.getPaymentOptions(),
        metaAPI.getPaymentModalities(),
      ]);
      setPaymentOptions(optionsData);
      setPaymentModalities(modalitiesData);
    } catch (error) {
      console.error('Failed to load payment metadata:', error);
      toast.error('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  const addInstallment = () => {
    const remainingPercentage = 100 - watchedInstallments.reduce((sum, inst) => sum + inst.percentage, 0);
    append({
      description: `Installment ${fields.length + 1}`,
      percentage: Math.max(0, remainingPercentage),
      amount: (servicesTotal * Math.max(0, remainingPercentage)) / 100,
      dueDate: '',
      paymentOption: 'CASH',
      transferCode: '',
      status: 'PENDING',
    });
  };

  const removeInstallment = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const updateNumberOfInstallments = (count: number) => {
    setNumberOfInstallments(count);
    if (watchedPaymentModality === 'MILESTONE_PAYMENTS') {
      const percentage = 100 / count;
      const newInstallments = Array.from({ length: count }, (_, index) => ({
        description: `Installment ${index + 1}`,
        percentage,
        amount: (servicesTotal * percentage) / 100,
        dueDate: '',
        paymentOption: 'CASH',
        transferCode: '',
        status: 'PENDING',
      }));
      replace(newInstallments);
    }
  };

  const isTransferCodeRequired = (installmentIndex?: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    // For FULL_PAYMENT mode, check global payment option
    if (watchedPaymentModality === 'FULL_PAYMENT') {
      if (watchedPaymentOption !== 'BANK_TRANSFER') return false;
      return watchedInstallments.some(installment => installment.dueDate === today);
    }
    
    // For individual installment
    if (installmentIndex !== undefined) {
      const installment = watchedInstallments[installmentIndex];
      return installment?.paymentOption === 'BANK_TRANSFER' && installment?.dueDate === today;
    }
    
    // Check if any installment needs transfer code
    return watchedInstallments.some(installment => 
      installment.paymentOption === 'BANK_TRANSFER' && installment.dueDate === today
    );
  };

  const calculateTotalPercentage = () => {
    return watchedInstallments.reduce((sum, installment) => {
      const percentage = typeof installment.percentage === 'string' 
        ? parseFloat(installment.percentage) || 0 
        : installment.percentage || 0;
      return sum + percentage;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaymentOptionLabel = (option: PaymentOption) => {
    switch (option) {
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CHEQUE': return 'Cheque';
      case 'POST': return 'Post';
      case 'CASH': return 'Cash';
      default: return option;
    }
  };

  const getPaymentModalityLabel = (modality: PaymentModality) => {
    switch (modality) {
      case 'FULL_PAYMENT': return 'Full Payment';
      case 'SIXTY_FORTY': return '60% - 40%';
      case 'MILESTONE_PAYMENTS': return 'Milestone Payments';
      default: return modality;
    }
  };

  const getStatusLabel = (status: InstallmentStatus) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'PAID': return 'Paid';
      default: return status;
    }
  };

  const getStatusIcon = (status: InstallmentStatus) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const savePayment = async () => {
    const formData = form.getValues();
    
    // Validate percentages sum to 100%
    const totalPercentage = calculateTotalPercentage();
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error(`Installment percentages must sum to 100%. Current total: ${totalPercentage.toFixed(2)}%`);
      return;
    }

    // Validate transfer codes if required
    if (formData.paymentModality === 'FULL_PAYMENT') {
      if (isTransferCodeRequired() && !formData.transferCode?.trim()) {
        toast.error('Transfer code is required for bank transfers due today');
        return;
      }
    } else {
      // For SIXTY_FORTY and MILESTONE_PAYMENTS, check each installment
      const missingTransferCodes = formData.installments.filter((installment, index) => 
        isTransferCodeRequired(index) && !installment.transferCode?.trim()
      );
      if (missingTransferCodes.length > 0) {
        toast.error('Transfer code is required for bank transfers due today');
        return;
      }
    }

    // Validate all due dates are filled
    const missingDates = formData.installments.filter(inst => !inst.dueDate);
    if (missingDates.length > 0) {
      toast.error('All due dates are required');
      return;
    }

    const payload: CreatePaymentData = {
      totalAmount: servicesTotal,
      paymentOption: formData.paymentModality === 'FULL_PAYMENT' ? formData.paymentOption : undefined,
      paymentModality: formData.paymentModality,
      transferCode: formData.paymentModality === 'FULL_PAYMENT' ? (formData.transferCode || undefined) : undefined,
      installments: formData.installments.map(installment => ({
        description: installment.description,
        percentage: installment.percentage,
        amount: installment.amount,
        dueDate: installment.dueDate,
        paymentOption: formData.paymentModality !== 'FULL_PAYMENT' ? installment.paymentOption : undefined,
        transferCode: formData.paymentModality !== 'FULL_PAYMENT' ? installment.transferCode : undefined,
        status: installment.status || 'PENDING',
      })),
    };

    try {
      setSaving(true);
      
      if (isEditing && editingPaymentId) {
        // Update existing payment
        await paymentsAPI.updatePayment(editingPaymentId, payload);
        toast.success('Payment updated successfully');
        setIsEditing(false);
        setEditingPaymentId(null);
      } else {
        // Create new payment
        if (!dossierId) {
          toast.error('No dossier selected. Please select a dossier first.');
          return;
        }
        
        // Add dossierId to payload
        const payloadWithDossier = {
          ...payload,
          dossierId: dossierId,
        };
        
        await paymentsAPI.createPayment(payloadWithDossier);
        toast.success('Payment saved successfully');
      }
      
      invalidateRelatedCaches(); // Invalidate caches to update counters and lists
      
      // Reset form if not editing
      if (!isEditing) {
        form.reset({
          paymentOption: 'CASH',
          paymentModality: 'FULL_PAYMENT',
          transferCode: '',
          installments: [
            {
              description: 'Full Payment',
              percentage: 100,
              amount: servicesTotal,
              dueDate: '',
              status: 'PENDING',
            },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to save payment:', error);
      toast.error('Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await paymentsAPI.deletePayment(paymentId);
      toast.success('Payment deleted successfully');
      invalidateRelatedCaches(); // Invalidate caches to update counters and lists
      setIsEditing(false);
      setEditingPaymentId(null);
    } catch (error) {
      console.error('Failed to delete payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  const startEditing = (payment: Payment) => {
    setIsEditing(true);
    setEditingPaymentId(payment.id);
    
    // Set the correct number of installments for milestone payments first
    if (payment.paymentModality === 'MILESTONE_PAYMENTS') {
      setNumberOfInstallments(payment.installments.length);
    }
    
    // Use setTimeout to ensure all state updates are applied before setting form data
    setTimeout(() => {
      // Pre-fill the form with existing payment data
      const formData = {
        paymentOption: payment.paymentModality === 'FULL_PAYMENT' ? payment.paymentOption : undefined,
        paymentModality: payment.paymentModality,
        transferCode: payment.paymentModality === 'FULL_PAYMENT' ? (payment.transferCode || '') : '',
        installments: payment.installments.map(installment => ({
          description: installment.description,
          percentage: parseFloat(installment.percentage),
          amount: parseFloat(installment.amount),
          dueDate: installment.dueDate.split('T')[0], // Convert ISO date to YYYY-MM-DD
          paymentOption: payment.paymentModality !== 'FULL_PAYMENT' ? (installment.paymentOption || 'CASH') : undefined,
          transferCode: payment.paymentModality !== 'FULL_PAYMENT' ? (installment.transferCode || '') : undefined,
          status: installment.status || 'PENDING',
        })),
      };

      console.log('Setting form data for editing:', formData);
      form.reset(formData);
    }, 50); // Small delay to ensure state synchronization
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingPaymentId(null);
    setNumberOfInstallments(2); // Reset to default
    
    // Reset form to default values
    form.reset({
      paymentOption: 'CASH',
      paymentModality: 'FULL_PAYMENT',
      transferCode: '',
      installments: [
        {
          description: 'Full Payment',
          percentage: 100,
          amount: servicesTotal,
          dueDate: '',
          status: 'PENDING',
        },
      ],
    });
  };

  if (paymentsLoading && !isNewClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading payment data...</div>
        </CardContent>
      </Card>
    );
  }

  if (isNewClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </CardTitle>
          <CardDescription>
            Payment options will be available after the client is created and services are added
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Please save the client and add services first
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dossierId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </CardTitle>
          <CardDescription>
            Please select a dossier to manage payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No dossier selected. Please select a dossier from the list above to view and manage payments.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (servicesTotal === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </CardTitle>
          <CardDescription>
            Add services first to configure payment options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No services found. Please add services to configure payments.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment
        </CardTitle>
        <CardDescription>
          Configure payment options{dossierId ? ` for dossier (#${dossierId.slice(-8).toUpperCase()})` : ' for this client'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Services Total */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Total of Services:</span>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(servicesTotal)}
            </span>
          </div>
        </div>

        {isAdmin && shouldShowConfigForm && (
          <form className="space-y-6">
            {/* Edit Mode Header */}
            {isEditing && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Edit Payment Configuration</h3>
                    <p className="text-sm text-blue-700">Modify the payment settings below</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Cancel Edit
                  </Button>
                </div>
              </div>
            )}
            {/* Payment Options - Only for FULL_PAYMENT */}
            {watchedPaymentModality === 'FULL_PAYMENT' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Payment Option</Label>
                <RadioGroup
                  value={form.watch('paymentOption') || ''}
                  onValueChange={(value) => form.setValue('paymentOption', value as PaymentOption)}
                  className="grid grid-cols-2 gap-4"
                >
                  {paymentOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option}>{getPaymentOptionLabel(option)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Payment Modalities */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Payment Modality</Label>
              <RadioGroup
                value={form.watch('paymentModality')}
                onValueChange={(value) => form.setValue('paymentModality', value as PaymentModality)}
                className="space-y-2"
              >
                {paymentModalities.map((modality) => (
                  <div key={modality} className="flex items-center space-x-2">
                    <RadioGroupItem value={modality} id={modality} />
                    <Label htmlFor={modality}>{getPaymentModalityLabel(modality)}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Milestone Payments - Number of Installments */}
            {watchedPaymentModality === 'MILESTONE_PAYMENTS' && (
              <div className="space-y-3">
                <Label htmlFor="installments-count" className="text-base font-semibold">
                  Number of Installments
                </Label>
                <Select
                  value={numberOfInstallments.toString()}
                  onValueChange={(value) => updateNumberOfInstallments(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Transfer Code - Only for FULL_PAYMENT */}
            {watchedPaymentModality === 'FULL_PAYMENT' && isTransferCodeRequired() && (
              <div className="space-y-2">
                <Label htmlFor="transferCode" className="text-base font-semibold text-red-600">
                  Transfer Code (Required - Due Today)
                </Label>
                <Input
                  id="transferCode"
                  placeholder="Enter transfer code"
                  {...form.register('transferCode')}
                  className="border-red-300 focus:border-red-500"
                />
              </div>
            )}

            {/* Payment Schedule Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Payment Schedule</Label>
                {watchedPaymentModality === 'MILESTONE_PAYMENTS' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInstallment}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Installment
                  </Button>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      {(watchedPaymentModality === 'SIXTY_FORTY' || watchedPaymentModality === 'MILESTONE_PAYMENTS') && (
                        <TableHead>Payment Option</TableHead>
                      )}
                      {(watchedPaymentModality === 'SIXTY_FORTY' || watchedPaymentModality === 'MILESTONE_PAYMENTS') && (
                        <TableHead>Transfer Code</TableHead>
                      )}
                      <TableHead>Status</TableHead>
                      {watchedPaymentModality === 'MILESTONE_PAYMENTS' && (
                        <TableHead className="w-20">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          {watchedPaymentModality === 'MILESTONE_PAYMENTS' ? (
                            <Input
                              {...form.register(`installments.${index}.description`)}
                              placeholder="Description"
                            />
                          ) : (
                            <span>{form.watch(`installments.${index}.description`)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {watchedPaymentModality === 'MILESTONE_PAYMENTS' ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                {...form.register(`installments.${index}.percentage`, {
                                  valueAsNumber: true,
                                  onChange: (e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    form.setValue(`installments.${index}.percentage`, value);
                                    // Trigger recalculation of amount
                                    const amount = (servicesTotal * value) / 100;
                                    form.setValue(`installments.${index}.amount`, amount);
                                  }
                                })}
                                className="w-20"
                              />
                              <span>%</span>
                            </div>
                          ) : (
                            <span>{form.watch(`installments.${index}.percentage`)}%</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(form.watch(`installments.${index}.amount`))}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            {...form.register(`installments.${index}.dueDate`)}
                            className="w-40"
                          />
                        </TableCell>
                        
                        {/* Payment Option for SIXTY_FORTY and MILESTONE_PAYMENTS */}
                        {(watchedPaymentModality === 'SIXTY_FORTY' || watchedPaymentModality === 'MILESTONE_PAYMENTS') && (
                          <TableCell>
                            <Select
                              value={form.watch(`installments.${index}.paymentOption`) || ''}
                              onValueChange={(value) => form.setValue(`installments.${index}.paymentOption`, value as PaymentOption)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {getPaymentOptionLabel(option)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                        
                        {/* Transfer Code for SIXTY_FORTY and MILESTONE_PAYMENTS */}
                        {(watchedPaymentModality === 'SIXTY_FORTY' || watchedPaymentModality === 'MILESTONE_PAYMENTS') && (
                          <TableCell>
                            <Input
                              placeholder={isTransferCodeRequired(index) ? "Required" : "Optional"}
                              {...form.register(`installments.${index}.transferCode`)}
                              className={isTransferCodeRequired(index) ? "border-red-300 focus:border-red-500" : ""}
                              disabled={form.watch(`installments.${index}.paymentOption`) !== 'BANK_TRANSFER'}
                            />
                          </TableCell>
                        )}

                        {/* Status Column */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={form.watch(`installments.${index}.status`) === 'PAID'}
                              onCheckedChange={(checked) => {
                                form.setValue(`installments.${index}.status`, checked ? 'PAID' : 'PENDING');
                              }}
                            />
                            <span className={`text-sm ${
                              form.watch(`installments.${index}.status`) === 'PAID' 
                                ? 'text-green-600 font-medium' 
                                : 'text-orange-600'
                            }`}>
                              {getStatusLabel(form.watch(`installments.${index}.status`) as InstallmentStatus)}
                            </span>
                            {getStatusIcon(form.watch(`installments.${index}.status`) as InstallmentStatus)}
                          </div>
                        </TableCell>
                        
                        {watchedPaymentModality === 'MILESTONE_PAYMENTS' && (
                          <TableCell>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeInstallment(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="font-semibold">
                        {calculateTotalPercentage().toFixed(2)}%
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(servicesTotal)}
                      </TableCell>
                      <TableCell></TableCell>
                      {(watchedPaymentModality === 'SIXTY_FORTY' || watchedPaymentModality === 'MILESTONE_PAYMENTS') && (
                        <>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </>
                      )}
                      <TableCell></TableCell>
                      {watchedPaymentModality === 'MILESTONE_PAYMENTS' && (
                        <TableCell></TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {Math.abs(calculateTotalPercentage() - 100) > 0.01 && (
                <p className="text-sm text-red-600">
                  ⚠️ Percentages must sum to exactly 100%. Current total: {calculateTotalPercentage().toFixed(2)}%
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={savePayment}
                disabled={saving || Math.abs(calculateTotalPercentage() - 100) > 0.01}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : (isEditing ? 'Update Payment' : 'Save Payment')}
              </Button>
            </div>
          </form>
        )}

        {/* Payment History - Only show when not editing and payments exist */}
        {!shouldShowConfigForm && payments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Payment History</h3>
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {getPaymentOptionLabel(payment.paymentOption)} - {getPaymentModalityLabel(payment.paymentModality)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Total: {formatCurrency(parseFloat(payment.totalAmount))}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(payment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePayment(payment.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Payment Option</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.installments.map((installment) => (
                          <TableRow key={installment.id}>
                            <TableCell>{installment.description}</TableCell>
                            <TableCell>{parseFloat(installment.percentage)}%</TableCell>
                            <TableCell>{formatCurrency(parseFloat(installment.amount))}</TableCell>
                            <TableCell>
                              {new Date(installment.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {payment.paymentModality === 'FULL_PAYMENT' 
                                ? getPaymentOptionLabel(payment.paymentOption)
                                : getPaymentOptionLabel(installment.paymentOption)
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(installment.status)}
                                <span className={`text-sm ${
                                  installment.status === 'PAID' 
                                    ? 'text-green-600 font-medium' 
                                    : 'text-orange-600'
                                }`}>
                                  {getStatusLabel(installment.status)}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

