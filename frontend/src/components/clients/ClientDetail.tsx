"use client";

import { useState, useEffect } from "react";
import CLientNotFound from "./CLientNotFound";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  clientsAPI,
  attachmentsAPI,
  employeesAPI,
  dossiersAPI,
} from "@/lib/api";
import {
  Client,
  Attachment,
  Employee,
  DossierEmployeeAssignment,
  Dossier,
} from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Download,
  Trash2,
  Upload,
  User,
  Phone,
  Building2,
  FileText,
  Users,
  Shield,
  CreditCard,
  Heart,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { ServicesSection } from "@/components/clients/ServicesSection";
import { PaymentSection } from "@/components/clients/PaymentSection";
import { DossiersList } from "./DossiersList";
import ClientInfo from "./clientDetails/ClientInfo";
import GuardianInfo from "./clientDetails/GuardianInfo";
import EmployeeAssignment from "./clientDetails/EmployeeAssignment";
import PhoneNumbers from "./clientDetails/PhoneNumbers";
import Employers from "./clientDetails/Employers";
import FamilyMembers from "./clientDetails/FamilyMembers";
import Attachments from "./clientDetails/Attachments";
import Timestamps from "./clientDetails/Timestamps";
import EmployeeAssignmentDialog from "./clientDetails/EmployeeAssignmentDialog";

interface ClientDetailProps {
  clientId: string;
}

export function ClientDetail({ clientId }: ClientDetailProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignedEmployees, setAssignedEmployees] = useState<
    DossierEmployeeAssignment[]
  >([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      const [clientData, attachmentsData, employeesData] = await Promise.all([
        clientsAPI.getById(clientId),
        attachmentsAPI.getByClient(clientId),
        employeesAPI.getAll(),
      ]);
      setClient(clientData);
      setAttachments(attachmentsData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error("Failed to load client data");
      console.error("Failed to load client data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDossierData = async () => {
    if (selectedDossier) {
      try {
        const updatedDossier = await dossiersAPI.getById(selectedDossier.id);
        setSelectedDossier(updatedDossier);
      } catch (error) {
        console.error("Failed to refresh dossier data:", error);
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await attachmentsAPI.upload(clientId, file, "DOCUMENT");
      toast.success("File uploaded successfully");
      loadClientData(); // Reload attachments
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await attachmentsAPI.delete(attachmentId);
      toast.success("File deleted successfully");
      loadClientData(); // Reload attachments
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      const blob = await attachmentsAPI.download(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployeeId || !selectedDossier) {
      toast.error("Please select an employee");
      return;
    }

    try {
      await dossiersAPI.assignEmployee(
        selectedDossier.id,
        selectedEmployeeId,
        selectedRole
      );
      toast.success("Employee assigned successfully");
      setIsAssignDialogOpen(false);
      setSelectedEmployeeId("");
      setSelectedRole("");
      refreshDossierData(); // Refresh dossier data to get updated assignments
    } catch (error) {
      console.error("Failed to assign employee:", error);
      toast.error("Failed to assign employee");
    }
  };
  useEffect(() => {
    const fetchAssignedEmployees = async () => {
      if (selectedDossier) {
        const assignedEmployees = await dossiersAPI.getAssignedEmployees(
          selectedDossier.id
        );
        setAssignedEmployees(assignedEmployees);
      }
    };
    fetchAssignedEmployees();
  }, [selectedDossier]);

  const handleUnassignEmployee = async (
    dossierId: string,
    employeeId: string
  ) => {
    if (!confirm("Are you sure you want to unassign this employee?")) return;

    try {
      await dossiersAPI.unassignEmployee(dossierId, employeeId);
      toast.success("Employee unassigned successfully");
      refreshDossierData(); // Refresh dossier data to get updated assignments
    } catch (error) {
      console.error("Failed to unassign employee:", error);
      toast.error("Failed to unassign employee");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING_DOCS":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading client data...</p>
      </div>
    );
  }

  if (!client) {
    return <CLientNotFound />;
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <ClientInfo client={client} />

      {/* Guardian Information */}
      {client.isMinor &&
        (client.guardianFullName ||
          client.guardianCIN ||
          client.guardianRelationship) && <GuardianInfo client={client} />}

      {/* Employee Assignment */}
      {selectedDossier && user && (
        <EmployeeAssignment
          selectedDossier={selectedDossier}
          assignedEmployees={assignedEmployees}
          handleUnassignEmployee={handleUnassignEmployee}
          user={user}
          setIsAssignDialogOpen={setIsAssignDialogOpen}
        />
      )}

      {/* Phone Numbers */}
      {client.phoneNumbers.length > 0 && <PhoneNumbers client={client} />}

      {/* Employers */}
      {client.employers.length > 0 && <Employers client={client} />}

      {/* Family Members */}
      {client.familyMembers.length > 0 && <FamilyMembers client={client} />}

      {/* Attachments */}

      <Attachments
        attachments={attachments}
        handleFileUpload={handleFileUpload}
        handleDownloadAttachment={handleDownloadAttachment}
        handleDeleteAttachment={handleDeleteAttachment}
        user={user}
        uploading={uploading}
      />

      {/* Dossiers Section */}
      <DossiersList
        clientId={clientId}
        clientName={client.fullName}
        onDossierSelect={setSelectedDossier}
      />

      {/* Services Section - Now synchronized with selected dossier */}
      <ServicesSection
        clientId={clientId}
        dossierId={selectedDossier?.id}
        dossierStatus={selectedDossier?.status}
      />

      {/* Payment Section - Now synchronized with selected dossier */}
      <PaymentSection
        clientId={clientId}
        dossierId={selectedDossier?.id}
        dossierStatus={selectedDossier?.status}
        totalAmount={selectedDossier?.totalAmount}
      />

      {/* Timestamps */}
      <Timestamps client={client} />

      {/* Employee Assignment Dialog */}
      <EmployeeAssignmentDialog
        isAssignDialogOpen={isAssignDialogOpen}
        setIsAssignDialogOpen={setIsAssignDialogOpen}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        setSelectedEmployeeId={setSelectedEmployeeId}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        handleAssignEmployee={handleAssignEmployee}
      />
    </div>
  );
}
