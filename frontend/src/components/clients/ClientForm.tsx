'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { clientsAPI, metaAPI, attachmentsAPI } from '@/lib/api';
import { CreateClientData, Client } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2, Upload } from 'lucide-react';
import { ServicesSection } from './ServicesSection';
import { PaymentSection } from './PaymentSection';

const createClientSchema = z.object({
  clientType: z.enum(['INDIVIDUAL', 'FAMILY', 'GROUP', 'PHONE_CALL']),
  fullName: z.string().min(1, 'Full name is required'),
  address: z.string().min(1, 'Address is required'),
  jobTitle: z.string().optional(),
  passportNumber: z.string().optional(),
  email: z.string().email('Invalid email address'),
  destination: z.string().min(1, 'Destination is required'),
  visaType: z.string().min(1, 'Visa type is required'),
  notes: z.string().optional(),
  phoneNumbers: z.array(z.object({
    number: z.string().min(1, 'Phone number is required'),
  })).default([]),
  employers: z.array(z.object({
    name: z.string().min(1, 'Employer name is required'),
    position: z.string().optional(),
  })).default([]),
}).refine((data) => {
  if (data.clientType !== 'PHONE_CALL' && !data.passportNumber) {
    return false;
  }
  return true;
}, {
  message: 'Passport number is required for non-phone call clients',
  path: ['passportNumber'],
});

type ClientFormData = z.infer<typeof createClientSchema>;

interface ClientFormProps {
  clientType: Client['clientType'];
  client?: Client;
  isEdit?: boolean;
}

export function ClientForm({ clientType, client, isEdit = false }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [visaTypes, setVisaTypes] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      clientType,
      fullName: client?.fullName || '',
      address: client?.address || '',
      jobTitle: client?.jobTitle || '',
      passportNumber: client?.passportNumber || '',
      email: client?.email || '',
      destination: client?.destination || '',
      visaType: client?.visaType || '',
      notes: client?.notes || '',
      phoneNumbers: client?.phoneNumbers.map(p => ({ number: p.number })) || [],
      employers: client?.employers.map(e => ({ name: e.name, position: e.position })) || [],
    },
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'phoneNumbers',
  });

  const { fields: employerFields, append: appendEmployer, remove: removeEmployer } = useFieldArray({
    control,
    name: 'employers',
  });

  useEffect(() => {
    loadVisaTypes();
  }, []);

  const loadVisaTypes = async () => {
    try {
      const types = await metaAPI.getVisaTypes();
      setVisaTypes(types);
    } catch (error) {
      console.error('Failed to load visa types:', error);
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      let clientId: string;

      if (isEdit && client) {
        await clientsAPI.update(client.id, data);
        clientId = client.id;
        toast.success('Client updated successfully');
      } else {
        const newClient = await clientsAPI.create(data);
        clientId = newClient.id;
        toast.success('Client created successfully');
      }

      // Upload file if selected
      if (selectedFile) {
        await attachmentsAPI.upload(clientId, selectedFile, 'PASSPORT');
        toast.success('File uploaded successfully');
      }

      router.push(`/clients/${clientId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the client's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                {...register('fullName')}
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <Input
                {...register('address')}
                placeholder="Enter address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <Input
                {...register('destination')}
                placeholder="Enter destination"
              />
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <Input
                {...register('jobTitle')}
                placeholder="Enter job title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passport Number {clientType !== 'PHONE_CALL' && '*'}
              </label>
              <Input
                {...register('passportNumber')}
                placeholder="Enter passport number"
                disabled={clientType === 'PHONE_CALL'}
              />
              {errors.passportNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.passportNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Type *
              </label>
              <Select
                value={watch('visaType')}
                onValueChange={(value) => setValue('visaType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  {visaTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visaType && (
                <p className="mt-1 text-sm text-red-600">{errors.visaType.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              {...register('notes')}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Phone Numbers</CardTitle>
          <CardDescription>
            Add phone numbers for the client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {phoneFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2">
              <Input
                {...register(`phoneNumbers.${index}.number`)}
                placeholder="Enter phone number"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePhone(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendPhone({ number: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Phone Number
          </Button>
        </CardContent>
      </Card>

      {/* Employers */}
      <Card>
        <CardHeader>
          <CardTitle>Employers</CardTitle>
          <CardDescription>
            Add employer information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {employerFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                {...register(`employers.${index}.name`)}
                placeholder="Employer name"
              />
              <div className="flex space-x-2">
                <Input
                  {...register(`employers.${index}.position`)}
                  placeholder="Position"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEmployer(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendEmployer({ name: '', position: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employer
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Upload passport or visa documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Upload className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PDF, JPG, JPEG, PNG (max 10MB)
          </p>
        </CardContent>
      </Card>

      {/* Services Section */}
      {client?.id ? (
        <ServicesSection clientId={client.id} />
      ) : (
        <ServicesSection isNewClient={true} />
      )}

      {/* Payment Section */}
      {client?.id ? (
        <PaymentSection clientId={client.id} />
      ) : (
        <PaymentSection isNewClient={true} />
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEdit ? 'Update Client' : 'Create Client')}
        </Button>
      </div>
    </form>
  );
}
