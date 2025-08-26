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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Full Name
              </label>
              <p className="text-lg font-semibold">{client.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{client.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Address
              </label>
              <p className="text-lg">{client.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Destination
              </label>
              <p className="text-lg">{client.destination}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Job Title
              </label>
              <p className="text-lg">{client.jobTitle || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Passport Number
              </label>
              <p className="text-lg">{client.passportNumber || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Visa Type
              </label>
              <p className="text-lg">{client.visaType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Client Type
              </label>
              <p className="text-lg">{client.clientType.replace("_", " ")}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge className={getStatusColor(client.status)}>
                {client.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Mineur</label>
            <div className="mt-1">
              <Badge
                className={
                  client.isMinor
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {client.isMinor ? "Oui" : "Non"}
              </Badge>
            </div>
          </div>
          {client.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-lg mt-1">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guardian Information */}
      {client.isMinor &&
        (client.guardianFullName ||
          client.guardianCIN ||
          client.guardianRelationship) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Guardian Information</span>
              </CardTitle>
              <CardDescription>
                Information du tuteur légal (client mineur)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.guardianFullName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nom complet du tuteur
                    </label>
                    <p className="text-lg font-semibold">
                      {client.guardianFullName}
                    </p>
                  </div>
                )}
                {client.guardianCIN && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      CIN du tuteur
                    </label>
                    <p className="text-lg">{client.guardianCIN}</p>
                  </div>
                )}
                {client.guardianRelationship && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Relation
                    </label>
                    <p className="text-lg">{client.guardianRelationship}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Employee Assignment */}
      {selectedDossier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Employee Assignment</span>
            </CardTitle>
            <CardDescription>
              Assign employees to dossier #
              {selectedDossier.id.slice(-8).toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Assignments */}
            {assignedEmployees && assignedEmployees.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Currently Assigned Employees
                </h4>
                {assignedEmployees.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">
                          {assignment.employee.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.role
                            ? `Role: ${assignment.role}`
                            : "No specific role"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Assigned:{" "}
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {user?.role === "ADMIN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUnassignEmployee(
                            selectedDossier.id,
                            assignment.employeeId
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No employees assigned to this dossier yet.
              </div>
            )}

            {/* Assign New Employee */}
            {user?.role === "ADMIN" && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Assign New Employee
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAssignDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign Employee
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phone Numbers */}
      {client.phoneNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Phone Numbers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {client.phoneNumbers.map((phone, index) => (
                <div key={phone.id} className="flex items-center space-x-2">
                  <span className="text-lg">{phone.number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employers */}
      {client.employers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Employers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.employers.map((employer) => (
                <div key={employer.id} className="border rounded-lg p-4">
                  <div className="font-semibold">{employer.name}</div>
                  {employer.position && (
                    <div className="text-gray-600">{employer.position}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Members */}
      {client.familyMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Family Members</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.familyMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {member.fullName}
                  </div>
                  <div className="text-gray-600 space-y-1 mt-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3" />
                      <span>Passport: {member.passportNumber}</span>
                    </div>
                    {member.relationship && (
                      <div className="flex items-center gap-2">
                        <Heart className="h-3 w-3" />
                        <span>Relationship: {member.relationship}</span>
                      </div>
                    )}
                    {member.age && (
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 flex items-center justify-center text-xs rounded-full bg-gray-200">
                          #
                        </span>
                        <span>Age: {member.age}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documents</span>
          </CardTitle>
          <CardDescription>Upload and manage client documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.roleName === "Admin" && (
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="flex-1"
                disabled={uploading}
              />
              <Upload className="h-4 w-4 text-gray-400" />
            </div>
          )}

          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {attachment.originalName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attachment.type} •{" "}
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {user?.roleName === "Admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No documents uploaded yet.
            </p>
          )}
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created
              </label>
              <p className="text-lg">{formatDate(client.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Updated
              </label>
              <p className="text-lg">{formatDate(client.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Employee to Dossier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee-select">Select Employee</Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.fullName} -{" "}
                      {employee.salaryType.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role-input">Role (Optional)</Label>
              <input
                id="role-input"
                type="text"
                placeholder="e.g., Case Manager, Assistant"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedEmployeeId("");
                  setSelectedRole("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignEmployee}>Assign Employee</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
