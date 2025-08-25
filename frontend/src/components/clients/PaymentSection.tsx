"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { paymentsAPI, metaAPI, servicesAPI } from "@/lib/api";
import {
  Payment,
  PaymentOption,
  PaymentModality,
  CreatePaymentData,
  ServiceItem,
  InstallmentStatus,
  UnprocessedServicesResponse,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Save,
  Trash2,
  Calculator,
  CreditCard,
  Edit,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PaymentFormData,
  PaymentFormSchema,
} from "@/lib/schema/paymentFormSchema";

// Validation Schema

interface PaymentSectionProps {
  clientId?: string;
  isNewClient?: boolean;
}

export function PaymentSection({
  clientId,
  isNewClient = false,
}: PaymentSectionProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [unprocessedServices, setUnprocessedServices] =
    useState<UnprocessedServicesResponse | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentModalities, setPaymentModalities] = useState<PaymentModality[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [numberOfInstallments, setNumberOfInstallments] = useState(2);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [showUnprocessedServices, setShowUnprocessedServices] = useState(false);
  const { user } = useAuth();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      paymentOption: "CASH",
      paymentModality: "FULL_PAYMENT",
      transferCode: "",
      installments: [
        {
          description: "Full Payment",
          percentage: 100,
          amount: 0,
          dueDate: "",
          status: "PENDING",
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "installments",
  });

  const isAdmin = user?.role === "ADMIN";
  const watchedPaymentOption = form.watch("paymentOption");
  const watchedPaymentModality = form.watch("paymentModality");
  const watchedInstallments = form.watch("installments");

  // Determine if we should show configuration form or payment history
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const shouldShowConfigForm =
    isNewClient || payments.length === 0 || isEditing || showNewPaymentForm;
  const currentPayment = editingPaymentId
    ? payments.find((p) => p.id === editingPaymentId)
    : null;

  // Determine the correct amount to use for payment calculations
  const getPaymentAmount = () => {
    // If there are unprocessed services, use their total amount
    if (unprocessedServices && unprocessedServices.totalAmount > 0) {
      return unprocessedServices.totalAmount;
    }
    // Otherwise use the services total
    return servicesTotal;
  };

  // Add a button to show the form for adding new payments

  useEffect(() => {
    if (clientId && !isNewClient) {
      loadData();
    } else {
      loadMetaData();
    }
  }, [clientId, isNewClient]);

  // Calculate services total when services change
  useEffect(() => {
    const total = services.reduce((sum, service) => {
      return sum + service.quantity * service.unitPrice;
    }, 0);
    setServicesTotal(total);
  }, [services]);

  // Update services total when unprocessed services are available
  useEffect(() => {
    if (unprocessedServices && unprocessedServices.totalAmount > 0) {
      setServicesTotal(unprocessedServices.totalAmount);
    }
  }, [unprocessedServices]);

  // Update installment amounts when total or percentages change (only when not editing existing payment)
  useEffect(() => {
    // Don't auto-update amounts when editing an existing payment initially
    if (isEditing && editingPaymentId) {
      return;
    }

    // Don't auto-update amounts if we're not showing the config form
    if (!shouldShowConfigForm) {
      return;
    }

    const paymentAmount = getPaymentAmount();
    const updatedInstallments = watchedInstallments.map((installment) => {
      const percentage =
        typeof installment.percentage === "string"
          ? parseFloat(installment.percentage) || 0
          : installment.percentage || 0;

      return {
        ...installment,
        percentage, // Ensure percentage is a number
        amount: (paymentAmount * percentage) / 100,
      };
    });

    // Only update if amounts have changed to avoid infinite loops
    const hasChanged = updatedInstallments.some((updated, index) => {
      const currentAmount =
        typeof watchedInstallments[index]?.amount === "string"
          ? parseFloat(watchedInstallments[index].amount) || 0
          : watchedInstallments[index]?.amount || 0;
      return Math.abs(updated.amount - currentAmount) > 0.01;
    });

    if (hasChanged) {
      form.setValue("installments", updatedInstallments);
    }
  }, [
    servicesTotal,
    unprocessedServices,
    form,
    isEditing,
    editingPaymentId,
    shouldShowConfigForm,
  ]); // Remove watchedInstallments from dependencies to avoid infinite loops

  // Handle payment modality changes (only when not editing existing payment)
  useEffect(() => {
    // Don't auto-replace fields when editing an existing payment
    if (isEditing && editingPaymentId) {
      return;
    }

    // Don't auto-replace fields if we're not showing the config form
    if (!shouldShowConfigForm) {
      return;
    }

    const paymentAmount = getPaymentAmount();
    switch (watchedPaymentModality) {
      case "FULL_PAYMENT":
        replace([
          {
            description: "Full Payment",
            percentage: 100,
            amount: paymentAmount,
            dueDate: "",
            status: "PENDING",
          },
        ]);
        break;
      case "SIXTY_FORTY":
        replace([
          {
            description: "First Payment - 60%",
            percentage: 60,
            amount: paymentAmount * 0.6,
            dueDate: "",
            paymentOption: "CASH" as const,
            transferCode: undefined,
            status: "PENDING" as const,
          },
          {
            description: "Second Payment - 40%",
            percentage: 40,
            amount: paymentAmount * 0.4,
            dueDate: "",
            paymentOption: "CASH" as const,
            transferCode: undefined,
            status: "PENDING" as const,
          },
        ]);
        break;
      case "MILESTONE_PAYMENTS":
        // Keep existing installments or create default ones
        if (fields.length === 0) {
          const defaultPercentage = 100 / numberOfInstallments;
          const defaultInstallments = Array.from(
            { length: numberOfInstallments },
            (_, index) => ({
              description: `Installment ${index + 1}`,
              percentage: defaultPercentage,
              amount: (paymentAmount * defaultPercentage) / 100,
              dueDate: "",
              paymentOption: "CASH" as const,
              transferCode: undefined,
              status: "PENDING" as const,
            })
          );
          replace(defaultInstallments);
        }
        break;
    }
  }, [
    watchedPaymentModality,
    servicesTotal,
    unprocessedServices,
    numberOfInstallments,
    replace,
    fields.length,
    isEditing,
    editingPaymentId,
    shouldShowConfigForm,
  ]);

  const loadData = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const [paymentsData, servicesData, unprocessedData] = await Promise.all([
        paymentsAPI.getClientPayments(clientId),
        servicesAPI.getClientServices(clientId),
        paymentsAPI.getUnprocessedServices(clientId),
      ]);
      setPayments(paymentsData);
      setServices(servicesData);
      setUnprocessedServices(unprocessedData);
    } catch (error) {
      console.error("Failed to load payment data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const loadUnprocessedServices = async () => {
    if (!clientId) return;
    try {
      const data = await paymentsAPI.getUnprocessedServices(clientId);
      setUnprocessedServices(data);
    } catch (error) {
      console.error("Failed to load unprocessed services:", error);
      toast.error("Failed to load unprocessed services");
    }
  };

  const loadMetaData = async () => {
    try {
      const [paymentOptionsData, paymentModalitiesData] = await Promise.all([
        metaAPI.getPaymentOptions(),
        metaAPI.getPaymentModalities(),
      ]);
      setPaymentOptions(paymentOptionsData);
      setPaymentModalities(paymentModalitiesData);
    } catch (error) {
      console.error("Failed to load metadata:", error);
      toast.error("Failed to load payment options");
    }
  };

  // Function to refresh services data
  const refreshServices = async () => {
    try {
      const servicesData = await servicesAPI.getClientServices(clientId!);
      setServices(servicesData);
      await loadUnprocessedServices();
    } catch (error) {
      console.error("Failed to refresh services:", error);
    }
  };

  const resetPaymentForm = () => {
    const paymentAmount = getPaymentAmount();
    form.reset({
      paymentOption: "CASH",
      paymentModality: "FULL_PAYMENT",
      transferCode: "",
      installments: [
        {
          description: "Full Payment",
          percentage: 100,
          amount: paymentAmount,
          dueDate: "",
          status: "PENDING" as const,
        },
      ],
    });
  };

  const handleAddNewPayment = () => {
    setShowNewPaymentForm(true);
    resetPaymentForm();
  };

  const addInstallment = () => {
    const remainingPercentage =
      100 - watchedInstallments.reduce((sum, inst) => sum + inst.percentage, 0);
    const paymentAmount = getPaymentAmount();
    append({
      description: `Installment ${fields.length + 1}`,
      percentage: Math.max(0, remainingPercentage),
      amount: (paymentAmount * Math.max(0, remainingPercentage)) / 100,
      dueDate: "",
      paymentOption: "CASH" as const,
      transferCode: undefined,
      status: "PENDING" as const,
    });
  };

  const removeInstallment = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const updateNumberOfInstallments = (count: number) => {
    setNumberOfInstallments(count);
    if (watchedPaymentModality === "MILESTONE_PAYMENTS") {
      const paymentAmount = getPaymentAmount();
      const percentage = 100 / count;
      const newInstallments = Array.from({ length: count }, (_, index) => ({
        description: `Installment ${index + 1}`,
        percentage,
        amount: (paymentAmount * percentage) / 100,
        dueDate: "",
        paymentOption: "CASH" as const,
        transferCode: undefined,
        status: "PENDING" as const,
      }));
      replace(newInstallments);
    }
  };

  const isTransferCodeRequired = (installmentIndex?: number) => {
    const today = new Date().toISOString().split("T")[0];

    // For FULL_PAYMENT mode, check global payment option
    if (watchedPaymentModality === "FULL_PAYMENT") {
      if (watchedPaymentOption !== "BANK_TRANSFER") return false;
      return watchedInstallments.some(
        (installment) => installment.dueDate === today
      );
    }

    // For individual installment
    if (installmentIndex !== undefined) {
      const installment = watchedInstallments[installmentIndex];
      return (
        installment?.paymentOption === "BANK_TRANSFER" &&
        installment?.dueDate === today
      );
    }

    // Check if any installment needs transfer code
    return watchedInstallments.some(
      (installment) =>
        installment.paymentOption === "BANK_TRANSFER" &&
        installment.dueDate === today
    );
  };

  const calculateTotalPercentage = () => {
    return watchedInstallments.reduce((sum, installment) => {
      const percentage =
        typeof installment.percentage === "string"
          ? parseFloat(installment.percentage) || 0
          : installment.percentage || 0;
      return sum + percentage;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  const getPaymentOptionLabel = (option: PaymentOption) => {
    switch (option) {
      case "BANK_TRANSFER":
        return "Bank Transfer";
      case "CHEQUE":
        return "Cheque";
      case "POST":
        return "Post";
      case "CASH":
        return "Cash";
      default:
        return option;
    }
  };

  const getPaymentModalityLabel = (modality: PaymentModality) => {
    switch (modality) {
      case "FULL_PAYMENT":
        return "Full Payment";
      case "SIXTY_FORTY":
        return "60% - 40%";
      case "MILESTONE_PAYMENTS":
        return "Milestone Payments";
      default:
        return modality;
    }
  };

  const getStatusLabel = (status: InstallmentStatus) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "PAID":
        return "Paid";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: InstallmentStatus) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const savePayment = async () => {
    const formData = form.getValues();

    // Validate percentages sum to 100%
    const totalPercentage = calculateTotalPercentage();
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error(
        `Installment percentages must sum to 100%. Current total: ${totalPercentage.toFixed(
          2
        )}%`
      );
      return;
    }

    // Validate transfer codes if required
    if (formData.paymentModality === "FULL_PAYMENT") {
      if (isTransferCodeRequired() && !formData.transferCode?.trim()) {
        toast.error("Transfer code is required for bank transfers due today");
        return;
      }
    } else {
      // For SIXTY_FORTY and MILESTONE_PAYMENTS, check each installment
      const missingTransferCodes = formData.installments.filter(
        (installment, index) =>
          isTransferCodeRequired(index) && !installment.transferCode?.trim()
      );
      if (missingTransferCodes.length > 0) {
        toast.error("Transfer code is required for bank transfers due today");
        return;
      }
    }

    // Validate all due dates are filled
    const missingDates = formData.installments.filter((inst) => !inst.dueDate);
    if (missingDates.length > 0) {
      toast.error("All due dates are required");
      return;
    }

    const payload: CreatePaymentData = {
      totalAmount: getPaymentAmount(),
      paymentOption:
        formData.paymentModality === "FULL_PAYMENT"
          ? formData.paymentOption
          : undefined,
      paymentModality: formData.paymentModality,
      transferCode:
        formData.paymentModality === "FULL_PAYMENT"
          ? formData.transferCode || undefined
          : undefined,
      installments: formData.installments.map((installment) => ({
        description: installment.description,
        percentage: installment.percentage,
        amount: installment.amount,
        dueDate: installment.dueDate,
        paymentOption:
          formData.paymentModality !== "FULL_PAYMENT"
            ? installment.paymentOption
            : undefined,
        transferCode:
          formData.paymentModality !== "FULL_PAYMENT"
            ? installment.transferCode
            : undefined,
        status: installment.status || "PENDING",
      })),
    };

    try {
      setSaving(true);

      if (isEditing && editingPaymentId) {
        // Update existing payment
        await paymentsAPI.updatePayment(editingPaymentId, payload);
        toast.success("Payment updated successfully and transaction adjusted");
        setIsEditing(false);
        setEditingPaymentId(null);
      } else {
        // Create new payment
        if (!clientId) {
          toast.error("Client ID is required");
          return;
        }
        await paymentsAPI.createPayment(clientId, payload);
        toast.success("Payment saved successfully");
      }

      loadData(); // Refresh the list

      // Reset form if not editing
      if (!isEditing) {
        resetPaymentForm();
        setShowNewPaymentForm(false);
      }
    } catch (error) {
      console.error("Failed to save payment:", error);
      toast.error("Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this payment? This will also delete the associated transaction."
      )
    )
      return;

    try {
      await paymentsAPI.deletePayment(paymentId);
      toast.success("Payment deleted successfully and transaction removed");
      loadData(); // Refresh the list
      setIsEditing(false);
      setEditingPaymentId(null);
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment");
    }
  };

  const markInstallmentAsPaid = async (installmentId: string) => {
    if (
      !confirm(
        "Mark this installment as paid? This will create a transaction in the financial system."
      )
    )
      return;

    try {
      await paymentsAPI.markInstallmentAsPaid(installmentId);
      toast.success("Installment marked as paid and transaction created");
      loadData(); // Refresh the list
    } catch (error) {
      console.error("Failed to mark installment as paid:", error);
      toast.error("Failed to mark installment as paid");
    }
  };

  const startEditing = (payment: Payment) => {
    setIsEditing(true);
    setEditingPaymentId(payment.id);

    // Set the correct number of installments for milestone payments first
    if (payment.paymentModality === "MILESTONE_PAYMENTS") {
      setNumberOfInstallments(payment.installments.length);
    }

    // Use setTimeout to ensure all state updates are applied before setting form data
    setTimeout(() => {
      // Pre-fill the form with existing payment data
      const formData = {
        paymentOption:
          payment.paymentModality === "FULL_PAYMENT"
            ? payment.paymentOption
            : undefined,
        paymentModality: payment.paymentModality,
        transferCode:
          payment.paymentModality === "FULL_PAYMENT"
            ? payment.transferCode || ""
            : "",
        installments: payment.installments.map((installment) => ({
          description: installment.description,
          percentage: parseFloat(installment.percentage),
          amount: installment.amount,
          dueDate: installment.dueDate.split("T")[0], // Convert ISO date to YYYY-MM-DD
          paymentOption:
            payment.paymentModality !== "FULL_PAYMENT"
              ? installment.paymentOption || "CASH"
              : undefined,
          transferCode:
            payment.paymentModality !== "FULL_PAYMENT"
              ? installment.transferCode || ""
              : undefined,
          status: installment.status || "PENDING",
        })),
      };

      console.log("Setting form data for editing:", formData);
      form.reset(formData);
    }, 50); // Small delay to ensure state synchronization
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingPaymentId(null);
    setShowNewPaymentForm(false);
    setNumberOfInstallments(2); // Reset to default
    resetPaymentForm();
  };

  if (loading && !isNewClient) {
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
            Payment options will be available after the client is created and
            services are added
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
          Configure payment options and schedule for this client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Services Total */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                {unprocessedServices && unprocessedServices.totalAmount > 0
                  ? "Unprocessed Services Total:"
                  : "Total of Services:"}
              </span>
              {isAdmin && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={refreshServices}
                  className="text-blue-600 hover:text-blue-800"
                  title="Refresh services total"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              )}
            </div>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(getPaymentAmount())}
            </span>
          </div>
        </div>

        {/* Unprocessed Services Section */}
        {unprocessedServices && unprocessedServices.serviceCount > 0 && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Unprocessed Services Available
                </span>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  {unprocessedServices.serviceCount} services
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setShowUnprocessedServices(!showUnprocessedServices)
                }
                className="text-orange-600 border-orange-300 hover:bg-orange-100"
              >
                {showUnprocessedServices ? "Hide Details" : "Show Details"}
              </Button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-800">
                Total unprocessed amount:
              </span>
              <span className="text-lg font-bold text-orange-900">
                {formatCurrency(unprocessedServices.totalAmount)}
              </span>
            </div>

            {showUnprocessedServices && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unprocessedServices.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          {service.serviceType.replace("_", " ")}
                        </TableCell>
                        <TableCell>{service.quantity}</TableCell>
                        <TableCell>
                          {formatCurrency(service.unitPrice)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(service.quantity * service.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">
                    Payment will be calculated from unprocessed services
                  </p>
                  <p className="text-xs mt-1">
                    When you create a payment, it will automatically include all
                    unprocessed services and mark them as processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAdmin && (shouldShowConfigForm || showNewPaymentForm) && (
          <form className="space-y-6">
            {/* Edit Mode Header */}
            {isEditing && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Edit Payment Configuration
                    </h3>
                    <p className="text-sm text-blue-700">
                      Modify the payment settings below
                    </p>
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

            {/* New Payment Header */}
            {showNewPaymentForm && !isEditing && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Add New Payment
                    </h3>
                    <p className="text-sm text-green-700">
                      Configure payment for new services
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {/* Payment Options - Only for FULL_PAYMENT */}
            {watchedPaymentModality === "FULL_PAYMENT" && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Payment Option
                </Label>
                <RadioGroup
                  value={form.watch("paymentOption") || ""}
                  onValueChange={(value) =>
                    form.setValue("paymentOption", value as PaymentOption)
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  {paymentOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option}>
                        {getPaymentOptionLabel(option)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Payment Modalities */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Payment Modality
              </Label>
              <RadioGroup
                value={form.watch("paymentModality")}
                onValueChange={(value) =>
                  form.setValue("paymentModality", value as PaymentModality)
                }
                className="space-y-2"
              >
                {paymentModalities.map((modality) => (
                  <div key={modality} className="flex items-center space-x-2">
                    <RadioGroupItem value={modality} id={modality} />
                    <Label htmlFor={modality}>
                      {getPaymentModalityLabel(modality)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Milestone Payments - Number of Installments */}
            {watchedPaymentModality === "MILESTONE_PAYMENTS" && (
              <div className="space-y-3">
                <Label
                  htmlFor="installments-count"
                  className="text-base font-semibold"
                >
                  Number of Installments
                </Label>
                <Select
                  value={numberOfInstallments.toString()}
                  onValueChange={(value) =>
                    updateNumberOfInstallments(parseInt(value))
                  }
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
            {watchedPaymentModality === "FULL_PAYMENT" &&
              isTransferCodeRequired() && (
                <div className="space-y-2">
                  <Label
                    htmlFor="transferCode"
                    className="text-base font-semibold text-red-600"
                  >
                    Transfer Code (Required - Due Today)
                  </Label>
                  <Input
                    id="transferCode"
                    placeholder="Enter transfer code"
                    {...form.register("transferCode")}
                    className="border-red-300 focus:border-red-500"
                  />
                </div>
              )}

            {/* Payment Schedule Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Payment Schedule
                </Label>
                {watchedPaymentModality === "MILESTONE_PAYMENTS" && (
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
                      {(watchedPaymentModality === "SIXTY_FORTY" ||
                        watchedPaymentModality === "MILESTONE_PAYMENTS") && (
                        <TableHead>Payment Option</TableHead>
                      )}
                      {(watchedPaymentModality === "SIXTY_FORTY" ||
                        watchedPaymentModality === "MILESTONE_PAYMENTS") && (
                        <TableHead>Transfer Code</TableHead>
                      )}
                      <TableHead>Status</TableHead>
                      {watchedPaymentModality === "MILESTONE_PAYMENTS" && (
                        <TableHead className="w-20">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          {watchedPaymentModality === "MILESTONE_PAYMENTS" ? (
                            <Input
                              {...form.register(
                                `installments.${index}.description`
                              )}
                              placeholder="Description"
                            />
                          ) : (
                            <span>
                              {form.watch(`installments.${index}.description`)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {watchedPaymentModality === "MILESTONE_PAYMENTS" ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                {...form.register(
                                  `installments.${index}.percentage`,
                                  {
                                    valueAsNumber: true,
                                    onChange: (e) => {
                                      const value =
                                        parseFloat(e.target.value) || 0;
                                      form.setValue(
                                        `installments.${index}.percentage`,
                                        value
                                      );
                                      // Trigger recalculation of amount
                                      const amount =
                                        (servicesTotal * value) / 100;
                                      form.setValue(
                                        `installments.${index}.amount`,
                                        amount
                                      );
                                    },
                                  }
                                )}
                                className="w-20"
                              />
                              <span>%</span>
                            </div>
                          ) : (
                            <span>
                              {form.watch(`installments.${index}.percentage`)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            form.watch(`installments.${index}.amount`)
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            {...form.register(`installments.${index}.dueDate`)}
                            className="w-40"
                          />
                        </TableCell>

                        {/* Payment Option for SIXTY_FORTY and MILESTONE_PAYMENTS */}
                        {(watchedPaymentModality === "SIXTY_FORTY" ||
                          watchedPaymentModality === "MILESTONE_PAYMENTS") && (
                          <TableCell>
                            <Select
                              value={
                                form.watch(
                                  `installments.${index}.paymentOption`
                                ) || ""
                              }
                              onValueChange={(value) =>
                                form.setValue(
                                  `installments.${index}.paymentOption`,
                                  value as PaymentOption
                                )
                              }
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
                        {(watchedPaymentModality === "SIXTY_FORTY" ||
                          watchedPaymentModality === "MILESTONE_PAYMENTS") && (
                          <TableCell>
                            <Input
                              placeholder={
                                isTransferCodeRequired(index)
                                  ? "Required"
                                  : "Optional"
                              }
                              {...form.register(
                                `installments.${index}.transferCode`
                              )}
                              className={
                                isTransferCodeRequired(index)
                                  ? "border-red-300 focus:border-red-500"
                                  : ""
                              }
                              disabled={
                                form.watch(
                                  `installments.${index}.paymentOption`
                                ) !== "BANK_TRANSFER"
                              }
                            />
                          </TableCell>
                        )}

                        {/* Status Column */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={
                                form.watch(`installments.${index}.status`) ===
                                "PAID"
                              }
                              onCheckedChange={(checked) => {
                                form.setValue(
                                  `installments.${index}.status`,
                                  checked ? "PAID" : "PENDING"
                                );
                              }}
                            />
                            <span
                              className={`text-sm ${
                                form.watch(`installments.${index}.status`) ===
                                "PAID"
                                  ? "text-green-600 font-medium"
                                  : "text-orange-600"
                              }`}
                            >
                              {getStatusLabel(
                                form.watch(
                                  `installments.${index}.status`
                                ) as InstallmentStatus
                              )}
                            </span>
                            {getStatusIcon(
                              form.watch(
                                `installments.${index}.status`
                              ) as InstallmentStatus
                            )}
                          </div>
                        </TableCell>

                        {watchedPaymentModality === "MILESTONE_PAYMENTS" && (
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
                        {formatCurrency(getPaymentAmount())}
                      </TableCell>
                      <TableCell></TableCell>
                      {(watchedPaymentModality === "SIXTY_FORTY" ||
                        watchedPaymentModality === "MILESTONE_PAYMENTS") && (
                        <>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </>
                      )}
                      <TableCell></TableCell>
                      {watchedPaymentModality === "MILESTONE_PAYMENTS" && (
                        <TableCell></TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {Math.abs(calculateTotalPercentage() - 100) > 0.01 && (
                <p className="text-sm text-red-600">
                  ⚠️ Percentages must sum to exactly 100%. Current total:{" "}
                  {calculateTotalPercentage().toFixed(2)}%
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={savePayment}
                disabled={
                  saving || Math.abs(calculateTotalPercentage() - 100) > 0.01
                }
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving
                  ? "Saving..."
                  : isEditing
                  ? "Update Payment"
                  : "Save Payment"}
              </Button>
            </div>
          </form>
        )}

        {/* Payment History - Only show when not editing and payments exist */}
        {payments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment History</h3>
              {isAdmin && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddNewPayment}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Payment
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  className="border-l-4 border-l-green-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {payment.paymentOption &&
                            getPaymentOptionLabel(payment.paymentOption)}{" "}
                          - {getPaymentModalityLabel(payment.paymentModality)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Total: {formatCurrency(payment.totalAmount)}
                        </p>
                        {payment.caisse && (
                          <p className="text-sm text-blue-600">
                            Caisse: {payment.caisse.name}
                          </p>
                        )}
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Transaction automatically synchronized
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
                          {isAdmin && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.installments.map((installment) => (
                          <TableRow key={installment.id}>
                            <TableCell>{installment.description}</TableCell>
                            <TableCell>
                              {parseFloat(installment.percentage)}%
                            </TableCell>
                            <TableCell>
                              {formatCurrency(installment.amount)}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                installment.dueDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {payment.paymentModality === "FULL_PAYMENT"
                                ? payment.paymentOption &&
                                  getPaymentOptionLabel(payment.paymentOption)
                                : installment.paymentOption &&
                                  getPaymentOptionLabel(
                                    installment.paymentOption
                                  )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(installment.status)}
                                <span
                                  className={`text-sm ${
                                    installment.status === "PAID"
                                      ? "text-green-600 font-medium"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {getStatusLabel(installment.status)}
                                </span>
                              </div>
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                {installment.status === "PENDING" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      markInstallmentAsPaid(installment.id)
                                    }
                                    className="text-green-600 hover:text-green-800"
                                    title="Mark as paid"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {installment.status === "PAID" && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <DollarSign className="h-3 w-3" />
                                    <span className="text-xs">
                                      Transaction created
                                    </span>
                                  </div>
                                )}
                              </TableCell>
                            )}
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
