'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { servicesAPI, metaAPI } from '@/lib/api';
import { ServiceItem, CreateServiceData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Save, Trash2, Edit, X } from 'lucide-react';

const ServiceRowSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be at least 0'),
});

const ServicesFormSchema = z.object({
  services: z.array(ServiceRowSchema).min(1, 'At least one service is required'),
});

type ServicesFormData = z.infer<typeof ServicesFormSchema>;

interface ServicesSectionProps {
  clientId?: string;
  isNewClient?: boolean;
}

export function ServicesSection({ clientId, isNewClient = false }: ServicesSectionProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priceLoadingStates, setPriceLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [prefilledPrices, setPrefilledPrices] = useState<{ [key: number]: boolean }>({});
  const [userModifiedPrices, setUserModifiedPrices] = useState<{ [key: number]: boolean }>({});
  const { user } = useAuth();

  const form = useForm<ServicesFormData>({
    resolver: zodResolver(ServicesFormSchema),
    defaultValues: {
      services: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'services',
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (clientId && !isNewClient) {
      loadData();
    } else {
      // Load service types for new clients too
      loadServiceTypes();
    }
  }, [clientId, isNewClient]);

  const loadServiceTypes = async () => {
    try {
      const typesData = await metaAPI.getServiceTypes();
      setServiceTypes(typesData);
    } catch (error) {
      console.error('Failed to load service types:', error);
      toast.error('Failed to load service types');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [servicesData, typesData] = await Promise.all([
        servicesAPI.getClientServices(clientId),
        metaAPI.getServiceTypes(),
      ]);
      setServices(servicesData);
      setServiceTypes(typesData);
    } catch (error) {
      console.error('Failed to load services data:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Debounced function to fetch last price
  const fetchLastPrice = useCallback(
    async (serviceType: string, index: number) => {
      if (!serviceType || userModifiedPrices[index]) return;

      setPriceLoadingStates(prev => ({ ...prev, [index]: true }));
      
      try {
        const response = await servicesAPI.getLastPrice(serviceType);
        if (response.unitPrice !== null && !userModifiedPrices[index]) {
          form.setValue(`services.${index}.unitPrice`, response.unitPrice);
          setPrefilledPrices(prev => ({ ...prev, [index]: true }));
        }
      } catch (error) {
        console.error('Failed to fetch last price:', error);
        // Silent error - don't show toast for price fetching failures
      } finally {
        setPriceLoadingStates(prev => ({ ...prev, [index]: false }));
      }
    },
    [form, userModifiedPrices]
  );

  // Debounce timer
  const [debounceTimers, setDebounceTimers] = useState<{ [key: number]: NodeJS.Timeout }>({});

  const handleServiceTypeChange = (value: string, index: number) => {
    form.setValue(`services.${index}.serviceType`, value);
    
    // Clear any existing timer for this index
    if (debounceTimers[index]) {
      clearTimeout(debounceTimers[index]);
    }

    // Set new timer
    const timer = setTimeout(() => {
      fetchLastPrice(value, index);
    }, 200);

    setDebounceTimers(prev => ({ ...prev, [index]: timer }));
  };

  const handlePriceChange = (index: number, value: string) => {
    setUserModifiedPrices(prev => ({ ...prev, [index]: true }));
    setPrefilledPrices(prev => ({ ...prev, [index]: false }));
    form.setValue(`services.${index}.unitPrice`, parseFloat(value) || 0);
  };

  const addServiceRow = () => {
    const newIndex = fields.length;
    append({
      serviceType: '',
      quantity: 1,
      unitPrice: 0,
    });
    // Reset states for new row
    setPrefilledPrices(prev => ({ ...prev, [newIndex]: false }));
    setUserModifiedPrices(prev => ({ ...prev, [newIndex]: false }));
    setPriceLoadingStates(prev => ({ ...prev, [newIndex]: false }));
  };

  const removeServiceRow = (index: number) => {
    // Clear timer if exists
    if (debounceTimers[index]) {
      clearTimeout(debounceTimers[index]);
    }
    
    // Clean up states
    setDebounceTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[index];
      return newTimers;
    });
    setPrefilledPrices(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      return newStates;
    });
    setUserModifiedPrices(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      return newStates;
    });
    setPriceLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      return newStates;
    });
    
    remove(index);
  };

  const saveSingleService = async (index: number) => {
    const serviceData = form.getValues(`services.${index}`);
    
    if (!serviceData.serviceType) {
      toast.error('Please select a service type');
      return;
    }

    // Ensure data types are correct
    const payload = {
      serviceType: serviceData.serviceType,
      quantity: Number(serviceData.quantity),
      unitPrice: Number(serviceData.unitPrice),
    };

    try {
      setSaving(true);
      await servicesAPI.createService(clientId, payload);
      toast.success('Service saved successfully');
      remove(index);
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Failed to save service:', error);
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const saveAllServices = async () => {
    const formData = form.getValues();
    
    if (formData.services.length === 0) {
      toast.error('No services to save');
      return;
    }

    // Validate all services have service types
    const invalidServices = formData.services.filter(s => !s.serviceType);
    if (invalidServices.length > 0) {
      toast.error('Please select service types for all services');
      return;
    }

    // Ensure data types are correct for all services
    const payload = {
      items: formData.services.map(service => ({
        serviceType: service.serviceType,
        quantity: Number(service.quantity),
        unitPrice: Number(service.unitPrice),
      }))
    };

    try {
      setSaving(true);
      await servicesAPI.createManyServices(clientId, payload);
      toast.success('Services saved successfully');
      form.reset({ services: [] });
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Failed to save services:', error);
      toast.error('Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await servicesAPI.deleteService(serviceId);
      toast.success('Service deleted successfully');
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    }
  };

  const calculateSubtotal = (quantity: number, unitPrice: number) => {
    return (quantity * unitPrice).toFixed(2);
  };

  const calculateTotal = () => {
    const formData = form.getValues();
    return formData.services.reduce((total, service) => {
      return total + (service.quantity * service.unitPrice);
    }, 0).toFixed(2);
  };

  if (loading && !isNewClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading services...</div>
        </CardContent>
      </Card>
    );
  }

  if (isNewClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Services can be added after the client is created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Please save the client first to add services
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Manage services for this client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Services Section */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Add New Services</h3>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceRow}
                  disabled={saving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Row
                </Button>
                {fields.length > 0 && (
                  <Button
                    type="button"
                    onClick={saveAllServices}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Services ({fields.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Dynamic Service Rows */}
            {fields.length > 0 && (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg">
                    <div className="col-span-3">
                      <Select
                        value={form.watch(`services.${index}.serviceType`)}
                        onValueChange={(value) => handleServiceTypeChange(value, index)}
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Service Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.services?.[index]?.serviceType && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.services[index]?.serviceType?.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        {...form.register(`services.${index}.quantity`)}
                        disabled={saving}
                      />
                      {form.formState.errors.services?.[index]?.quantity && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.services[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Unit Price"
                          min="0"
                          step="0.01"
                          value={form.watch(`services.${index}.unitPrice`) || ''}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          disabled={saving || priceLoadingStates[index]}
                          className={prefilledPrices[index] ? 'border-blue-300 bg-blue-50' : ''}
                        />
                        {priceLoadingStates[index] && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                      </div>
                      {prefilledPrices[index] && (
                        <p className="text-xs text-blue-600 mt-1">
                          ✓ Prérempli depuis l&apos;historique
                        </p>
                      )}
                      {form.formState.errors.services?.[index]?.unitPrice && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.services[index]?.unitPrice?.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Input
                        type="text"
                        placeholder="Subtotal"
                        value={calculateSubtotal(
                          form.watch(`services.${index}.quantity`) || 0,
                          form.watch(`services.${index}.unitPrice`) || 0
                        )}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="col-span-2 flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => saveSingleService(index)}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeServiceRow(index)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                {fields.length > 0 && (
                  <div className="flex justify-end">
                    <div className="text-lg font-semibold">
                      Total: ${calculateTotal()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Existing Services Table */}
        <div>
          <h3 className="text-lg font-medium mb-4">Existing Services</h3>
          {services.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No services added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Created</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.serviceType}</TableCell>
                    <TableCell>{service.quantity}</TableCell>
                    <TableCell>${parseFloat(service.unitPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      ${(service.quantity * parseFloat(service.unitPrice)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(service.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
