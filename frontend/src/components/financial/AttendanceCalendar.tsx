"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeesAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Minus,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  attendance?: AttendanceRecord;
}

export function AttendanceCalendar() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [formData, setFormData] = useState({
    status: "PRESENT" as "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY",
    reason: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadAttendanceForMonth();
    }
  }, [selectedEmployee, currentDate]);

  const loadEmployees = async () => {
    try {
      const employeesData = await employeesAPI.getAll();
      setEmployees(employeesData.filter((emp: Employee) => emp.isActive));
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Erreur lors du chargement des employés");
    }
  };

  const loadAttendanceForMonth = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const records = await employeesAPI.getAttendance(
        selectedEmployee.id,
        startDate,
        endDate
      );
      setAttendanceRecords(records);
    } catch (error) {
      console.error("Error loading attendance records:", error);
      toast.error("Erreur lors du chargement des présences");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-500 hover:bg-green-600";
      case "ABSENT":
        return "bg-red-500 hover:bg-red-600";
      case "LATE":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "HALF_DAY":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-gray-300 hover:bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle className="h-3 w-3" />;
      case "ABSENT":
        return <XCircle className="h-3 w-3" />;
      case "LATE":
        return <AlertTriangle className="h-3 w-3" />;
      case "HALF_DAY":
        return <Minus className="h-3 w-3" />;
      default:
        return null;
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

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);

    while (currentDateObj <= endDate) {
      const dateString = currentDateObj.toISOString().split("T")[0];
      const attendance = attendanceRecords.find(
        (record) =>
          new Date(record.date).toISOString().split("T")[0] === dateString
      );

      days.push({
        date: new Date(currentDateObj),
        dayOfMonth: currentDateObj.getDate(),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        attendance,
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!selectedEmployee) return;

    setSelectedDate(day.date.toISOString().split("T")[0]);
    setFormData({
      status: day.attendance?.status || "PRESENT",
      reason: day.attendance?.reason || "",
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

      // Reset form
      setFormData({
        status: "PRESENT",
        reason: "",
      });

      // Reload attendance records
      await loadAttendanceForMonth();
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Erreur lors de l'enregistrement de la présence");
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendrier de Présence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Selection */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              value={selectedEmployee?.id || ""}
              onValueChange={(value) => {
                const employee = employees.find((emp) => emp.id === value);
                setSelectedEmployee(employee || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName} -{" "}
                    {employee.department || "Département non spécifié"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedEmployee && (
          <>
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold capitalize">
                  {formatMonthYear(currentDate)}
                </h3>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Aujourd'hui
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Présent</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>En retard</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Demi-journée</span>
              </div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="text-center py-8">
                Chargement du calendrier...
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 rounded"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  return (
                    <div
                      key={index}
                      className={`
                       p-2 min-h-[60px] border rounded cursor-pointer transition-colors
                       ${
                         !day.isCurrentMonth
                           ? "text-gray-400 bg-gray-50"
                           : "hover:bg-gray-50"
                       }
                       ${day.isToday ? "ring-2 ring-blue-500" : ""}
                       ${
                         day.attendance
                           ? getStatusColor(day.attendance.status) +
                             " text-white"
                           : ""
                       }
                     `}
                      onClick={() => handleDayClick(day)}
                      title={
                        day.attendance
                          ? `${day.attendance.date}: ${getStatusLabel(
                              day.attendance.status
                            )}${
                              day.attendance.reason
                                ? ` - ${day.attendance.reason}`
                                : ""
                            }`
                          : `${day.date.toLocaleDateString()}: Aucune donnée`
                      }
                    >
                      <div className="text-sm font-medium mb-1">
                        {day.dayOfMonth}
                      </div>
                      {day.attendance && (
                        <div className="flex items-center justify-center">
                          {getStatusIcon(day.attendance.status)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">
                Résumé du mois - {selectedEmployee.fullName}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>
                    Présent:{" "}
                    {
                      attendanceRecords.filter((r) => r.status === "PRESENT")
                        .length
                    }{" "}
                    jours
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>
                    Absent:{" "}
                    {
                      attendanceRecords.filter((r) => r.status === "ABSENT")
                        .length
                    }{" "}
                    jours
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>
                    En retard:{" "}
                    {
                      attendanceRecords.filter((r) => r.status === "LATE")
                        .length
                    }{" "}
                    jours
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>
                    Demi-journée:{" "}
                    {
                      attendanceRecords.filter((r) => r.status === "HALF_DAY")
                        .length
                    }{" "}
                    jours
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {!selectedEmployee && (
          <div className="text-center py-8 text-gray-500">
            Veuillez sélectionner un employé pour voir son calendrier de
            présence
          </div>
        )}
      </CardContent>

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
              <div className="p-2 bg-gray-50 rounded border">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("fr-FR")
                  : ""}
              </div>
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
                  setFormData({
                    status: "PRESENT",
                    reason: "",
                  });
                }}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer la Présence</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
