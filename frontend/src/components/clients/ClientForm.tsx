"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { clientsAPI, metaAPI, attachmentsAPI } from "@/lib/api";
import { CreateClientData, Client, ClientFormProps } from "@/types";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { ServicesSection } from "./ServicesSection";
import { PaymentSection } from "./PaymentSection";
import { createClientSchema } from "@/lib/schema/createClient.schema";
import { getClientFormDefaults } from "@/lib/forms/clientFormDefaults";
type ClientFormData = z.infer<typeof createClientSchema>;

export function ClientForm({
  clientType,
  client,
  isEdit = false,
}: ClientFormProps) {
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
    defaultValues: getClientFormDefaults(client, clientType),
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const {
    fields: employerFields,
    append: appendEmployer,
    remove: removeEmployer,
  } = useFieldArray({
    control,
    name: "employers",
  });

  const {
    fields: familyMemberFields,
    append: appendFamilyMember,
    remove: removeFamilyMember,
  } = useFieldArray({
    control,
    name: "familyMembers",
  });

  useEffect(() => {
    loadVisaTypes();
  }, []);

  const loadVisaTypes = async () => {
    try {
      const types = await metaAPI.getVisaTypes();
      setVisaTypes(types);
    } catch (error) {
      console.error("Failed to load visa types:", error);
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      let clientId: string;

      // Prepare data, only include guardian fields when necessary
      const submitData = { ...data };
      if (!(data.clientType === "INDIVIDUAL" && data.isMinor)) {
        delete submitData.guardianFullName;
        delete submitData.guardianCIN;
        delete submitData.guardianRelationship;
      }

      // Only include familyMembers for FAMILY and GROUP types
      if (!(data.clientType === "FAMILY" || data.clientType === "GROUP")) {
        delete submitData.familyMembers;
      }

      if (isEdit && client) {
        await clientsAPI.update(client.id, submitData);
        clientId = client.id;
        toast.success("Client updated successfully");
      } else {
        const newClient = await clientsAPI.create(submitData);
        clientId = newClient.id;
        toast.success("Client created successfully");
      }

      // Upload file if selected
      if (selectedFile) {
        await attachmentsAPI.upload(clientId, selectedFile, "PASSPORT");
        toast.success("File uploaded successfully");
      }

      router.push(`/clients/${clientId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save client";
      toast.error(message);
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
              <Input {...register("fullName")} placeholder="Enter full name" />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                {...register("email")}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <Input {...register("address")} placeholder="Enter address" />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <Input
                {...register("destination")}
                placeholder="Enter destination"
              />
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.destination.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <Input {...register("jobTitle")} placeholder="Enter job title" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passport Number {clientType !== "PHONE_CALL" && "*"}
              </label>
              <Input
                {...register("passportNumber")}
                placeholder="Enter passport number"
                disabled={clientType === "PHONE_CALL"}
              />
              {errors.passportNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passportNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Type *
              </label>
              <Select
                value={watch("visaType")}
                onValueChange={(value) => setValue("visaType", value)}
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.visaType.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              {...register("notes")}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMinor"
              checked={watch("isMinor")}
              onCheckedChange={(checked) =>
                setValue("isMinor", checked as boolean)
              }
            />
            <label
              htmlFor="isMinor"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mineur (moins de 18 ans)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Section - shown only for INDIVIDUAL clients who are minors */}
      {watch("clientType") === "INDIVIDUAL" && watch("isMinor") && (
        <Card>
          <CardHeader>
            <CardTitle>Guardian Information</CardTitle>
            <CardDescription>
              Guardian information is required for minors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Full Name *
                </label>
                <Input
                  {...register("guardianFullName")}
                  placeholder="Enter guardian full name"
                />
                {errors.guardianFullName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.guardianFullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian CIN *
                </label>
                <Input
                  {...register("guardianCIN")}
                  placeholder="Enter guardian CIN"
                />
                {errors.guardianCIN && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.guardianCIN.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship *
                </label>
                <Select
                  value={watch("guardianRelationship")}
                  onValueChange={(value) =>
                    setValue("guardianRelationship", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mother">Mère</SelectItem>
                    <SelectItem value="Father">Père</SelectItem>
                    <SelectItem value="Grandmother">Grand-mère</SelectItem>
                    <SelectItem value="Grandfather">Grand-père</SelectItem>
                    <SelectItem value="Aunt">Tante</SelectItem>
                    <SelectItem value="Uncle">Oncle</SelectItem>
                    <SelectItem value="Legal Guardian">Tuteur légal</SelectItem>
                    <SelectItem value="Other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                {errors.guardianRelationship && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.guardianRelationship.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Phone Numbers</CardTitle>
          <CardDescription>Add phone numbers for the client</CardDescription>
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
            onClick={() => appendPhone({ number: "" })}
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
          <CardDescription>Add employer information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {employerFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
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
            onClick={() => appendEmployer({ name: "", position: "" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employer
          </Button>
        </CardContent>
      </Card>

      {/* Family Members */}
      {(watch("clientType") === "FAMILY" ||
        watch("clientType") === "GROUP") && (
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Add family or group members</CardDescription>
          </CardHeader>
          <CardContent>
            {familyMemberFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-4 mb-4 p-4 border rounded-lg"
              >
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <Input
                    {...register(`familyMembers.${index}.fullName`)}
                    placeholder="Full name"
                  />
                  {errors.familyMembers?.[index]?.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.familyMembers[index]?.fullName?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-sm font-medium mb-1">
                    Passport Number *
                  </label>
                  <Input
                    {...register(`familyMembers.${index}.passportNumber`)}
                    placeholder="Passport number"
                  />
                  {errors.familyMembers?.[index]?.passportNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.familyMembers[index]?.passportNumber?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-8 sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Relationship
                  </label>
                  <Select
                    value={watch(`familyMembers.${index}.relationship`) || ""}
                    onValueChange={(value) =>
                      setValue(`familyMembers.${index}.relationship`, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="grandchild">Grandchild</SelectItem>
                      <SelectItem value="uncle">Uncle</SelectItem>
                      <SelectItem value="aunt">Aunt</SelectItem>
                      <SelectItem value="cousin">Cousin</SelectItem>
                      <SelectItem value="nephew">Nephew</SelectItem>
                      <SelectItem value="niece">Niece</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-8 sm:col-span-1">
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <Input
                    type="number"
                    min="0"
                    {...register(`familyMembers.${index}.age`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Age"
                  />
                </div>
                <div className="col-span-4 sm:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFamilyMember(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendFamilyMember({
                  fullName: "",
                  passportNumber: "",
                  relationship: "",
                  age: undefined,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            {errors.familyMembers?.root && (
              <p className="text-red-500 text-sm mt-2">
                {errors.familyMembers.root.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Upload passport or visa documents</CardDescription>
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
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
