"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { employeesAPI } from "@/lib/api";
import { toast } from "sonner";
import { AttendanceCalendar } from "./AttendanceCalendar";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Minus,
  Plus,
  Search,
  Filter,
  CalendarDays,
  Grid3X3,
  List,
} from "lucide-react";

interface Employee {
  id: string;
  fullName: string;
  email?: string;
  department?: string;
  isActive: boolean;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  reason?: string;
  createdAt: string;
  employee?: {
    fullName: string;
  };
}

export function AttendanceManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [formData, setFormData] = useState({
    status: "PRESENT" as "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const employeesData = await employeesAPI.getAll();
      setEmployees(employeesData.filter((emp: Employee) => emp.isActive));
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async (
    employeeId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      if (employeeId) {
        const records = await employeesAPI.getAttendance(
          employeeId,
          startDate,
          endDate
        );
        setAttendanceRecords(records);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error("Error loading attendance records:", error);
      toast.error("Erreur lors du chargement des présences");
    }
  };

  const handleViewHistory = async (employee: Employee) => {
    try {
      // Load attendance records for the last 30 days by default
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const records = await employeesAPI.getAttendance(
        employee.id,
        startDate,
        endDate
      );
      setAttendanceRecords(records);

      // Set the employee name in the history section
      setSelectedEmployee(employee);

      toast.success(`Historique chargé pour ${employee.fullName}`);
    } catch (error) {
      console.error("Error loading attendance history:", error);
      toast.error("Erreur lors du chargement de l'historique");
    }
  };

  const resetForm = () => {
    setFormData({
      status: "PRESENT",
      reason: "",
    });
    setSelectedEmployee(null);
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const openAttendanceDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setFormData({
      status: "PRESENT",
      reason: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      toast.error("Veuillez sélectionner un employé");
      return;
    }

    try {
      await employeesAPI.markAttendance(selectedEmployee.id, {
        date: selectedDate,
        status: formData.status,
        reason: formData.reason || undefined,
      });

      toast.success("Présence enregistrée avec succès");
      setDialogOpen(false);
      resetForm();

      // Reload attendance records for the selected employee
      await loadAttendanceRecords(selectedEmployee.id);
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Erreur lors de l'enregistrement de la présence");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "Présent";
      case "ABSENT":
        return "Absent";
      case "LATE":
        return "En retard";
      case "HALF_DAY":
        return "Demi-journée";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      case "LATE":
        return "bg-yellow-100 text-yellow-800";
      case "HALF_DAY":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle className="h-4 w-4" />;
      case "ABSENT":
        return <XCircle className="h-4 w-4" />;
      case "LATE":
        return <AlertTriangle className="h-4 w-4" />;
      case "HALF_DAY":
        return <Minus className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendanceRecords = attendanceRecords.filter((record) => {
    const matchesStatus =
      !statusFilter || statusFilter === "all" || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date === dateFilter;
    return matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des employés...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion de la Présence</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-1" />
            Liste
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Calendrier
          </Button>
        </div>
      </div>

      {viewMode === "list" && (
        <>
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email ou département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PRESENT">Présent</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">En retard</SelectItem>
                  <SelectItem value="HALF_DAY">Demi-journée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filtrer par date"
              />
            </div>
          </div>
        </>
      )}

      {viewMode === "list" ? (
        <>
          {/* Employees List */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Employés</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Aucun employé trouvé
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <Card key={employee.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {employee.fullName}
                            </h3>
                            <Badge variant="outline">
                              {employee.department ||
                                "Département non spécifié"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>Email: {employee.email || "Non spécifié"}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAttendanceDialog(employee)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Marquer Présence
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewHistory(employee)}
                          >
                            <CalendarDays className="h-4 w-4 mr-1" />
                            Mise a jour Historique
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <AttendanceCalendar />
      )}

      {/* Attendance Records */}
      {attendanceRecords.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Historique des Présences - {selectedEmployee?.fullName}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAttendanceRecords([]);
                setSelectedEmployee(null);
              }}
            >
              Effacer l'historique
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAttendanceRecords.map((record) => (
                <Card key={record.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {record.employee?.fullName || "Employé inconnu"}
                        </h3>
                        <Badge className={getStatusColor(record.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(record.status)}
                            {getStatusLabel(record.status)}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>
                          Date: {new Date(record.date).toLocaleDateString()}
                        </div>
                        {record.reason && <div>Raison: {record.reason}</div>}
                        <div>
                          Enregistré le:{" "}
                          {new Date(record.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Marquer la Présence - {selectedEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Présent</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">En retard</SelectItem>
                  <SelectItem value="HALF_DAY">Demi-journée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Raison (optionnel)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Raison de l'absence ou du retard..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer la Présence</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
