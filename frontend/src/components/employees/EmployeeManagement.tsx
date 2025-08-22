"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employeesAPI } from "@/lib/api";
import {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  Attendance,
  AttendanceStatus,
  CommissionReport,
} from "@/types";
import { toast } from "sonner";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [commissionReport, setCommissionReport] =
    useState<CommissionReport | null>(null);

  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState<CreateEmployeeData>({
    fullName: "",
    salaryType: "MONTHLY",
    salaryAmount: 0,
    commissionPercentage: "0",
    soldeCoungiee: 0,
  });

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateEmployeeData>({});

  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "PRESENT" as AttendanceStatus,
    reason: "",
  });

  // Commission form state
  const [commissionForm, setCommissionForm] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesAPI.getEmployeesWithStats();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to load employees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      await employeesAPI.create(createForm);
      toast.success("Employee created successfully");
      setIsCreateDialogOpen(false);
      setCreateForm({
        fullName: "",
        salaryType: "MONTHLY",
        salaryAmount: 0,
        commissionPercentage: "0",
        soldeCoungiee: 0,
      });
      loadEmployees();
    } catch (error) {
      toast.error("Failed to create employee");
      console.error(error);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await employeesAPI.update(selectedEmployee.id, editForm);
      toast.success("Employee updated successfully");
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      setEditForm({});
      loadEmployees();
    } catch (error) {
      toast.error("Failed to update employee");
      console.error(error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await employeesAPI.delete(id);
      toast.success("Employee deleted successfully");
      loadEmployees();
    } catch (error) {
      toast.error("Failed to delete employee");
      console.error(error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedEmployee) return;
    try {
      await employeesAPI.markAttendance(selectedEmployee.id, attendanceForm);
      toast.success("Attendance marked successfully");
      setIsAttendanceDialogOpen(false);
      setAttendanceForm({
        date: new Date().toISOString().split("T")[0],
        status: "PRESENT",
        reason: "",
      });
      loadAttendance(selectedEmployee.id);
    } catch (error) {
      toast.error("Failed to mark attendance");
      console.error(error);
    }
  };

  const loadAttendance = async (employeeId: string) => {
    try {
      const data = await employeesAPI.getAttendance(employeeId);
      setAttendance(data);
    } catch (error) {
      toast.error("Failed to load attendance");
      console.error(error);
    }
  };

  const handleCalculateCommission = async () => {
    if (!selectedEmployee) return;
    try {
      const data = await employeesAPI.calculateCommission(
        selectedEmployee.id,
        commissionForm.startDate,
        commissionForm.endDate
      );
      setCommissionReport(data);
    } catch (error) {
      toast.error("Failed to calculate commission");
      console.error(error);
    }
  };

  const handleCalculateSoldeCoungiee = async (employeeId: string) => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      await employeesAPI.calculateMonthlySoldeCoungiee(employeeId, month, year);
      toast.success("Solde Coungiee calculated successfully");
      loadEmployees();
    } catch (error) {
      toast.error("Failed to calculate Solde Coungiee");
      console.error(error);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditForm({
      fullName: employee.fullName,
      salaryType: employee.salaryType,
      salaryAmount: parseFloat(employee.salaryAmount),
      commissionPercentage: employee.commissionPercentage,
      soldeCoungiee: parseFloat(employee.soldeCoungiee),
    });
    setIsEditDialogOpen(true);
  };

  const openAttendanceDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    loadAttendance(employee.id);
    setIsAttendanceDialogOpen(true);
  };

  const openCommissionDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsCommissionDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={createForm.fullName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fullName: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salaryType" className="text-right">
                  Salary Type
                </Label>
                <Select
                  value={createForm.salaryType}
                  onValueChange={(value: any) =>
                    setCreateForm({ ...createForm, salaryType: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="CLIENTCOMMISSION">
                      Client Commission
                    </SelectItem>
                    <SelectItem value="PERIODCOMMISSION">
                      Period Commission
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salaryAmount" className="text-right">
                  Salary Amount
                </Label>
                <Input
                  id="salaryAmount"
                  type="number"
                  value={createForm.salaryAmount}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      salaryAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commissionPercentage" className="text-right">
                  Commission %
                </Label>
                <Input
                  id="commissionPercentage"
                  value={createForm.commissionPercentage}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      commissionPercentage: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="soldeCoungiee" className="text-right">
                  Solde Coungiee
                </Label>
                <Input
                  id="soldeCoungiee"
                  type="number"
                  value={createForm.soldeCoungiee}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      soldeCoungiee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEmployee}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Salary Type</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Solde Coungiee</TableHead>
                <TableHead>Assigned Clients</TableHead>
                <TableHead>Current Month Absences</TableHead>
                <TableHead>Total Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.fullName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.salaryType}</Badge>
                  </TableCell>
                  <TableCell>
                    ${parseFloat(employee.salaryAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>{employee.commissionPercentage}%</TableCell>
                  <TableCell>
                    {parseFloat(employee.soldeCoungiee).toFixed(2)}
                  </TableCell>
                  <TableCell>{employee.assignedClientsCount || 0}</TableCell>
                  <TableCell>{employee.currentMonthAbsences || 0}</TableCell>
                  <TableCell>
                    ${(employee.totalCommission || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAttendanceDialog(employee)}
                      >
                        Attendance
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCommissionDialog(employee)}
                      >
                        Commission
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCalculateSoldeCoungiee(employee.id)
                        }
                      >
                        Calculate Solde
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editFullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="editFullName"
                value={editForm.fullName || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, fullName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSalaryType" className="text-right">
                Salary Type
              </Label>
              <Select
                value={editForm.salaryType}
                onValueChange={(value: any) =>
                  setEditForm({ ...editForm, salaryType: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="CLIENTCOMMISSION">
                    Client Commission
                  </SelectItem>
                  <SelectItem value="PERIODCOMMISSION">
                    Period Commission
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSalaryAmount" className="text-right">
                Salary Amount
              </Label>
              <Input
                id="editSalaryAmount"
                type="number"
                value={editForm.salaryAmount || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    salaryAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editCommissionPercentage" className="text-right">
                Commission %
              </Label>
              <Input
                id="editCommissionPercentage"
                value={editForm.commissionPercentage || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    commissionPercentage: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSoldeCoungiee" className="text-right">
                Solde Coungiee
              </Label>
              <Input
                id="editSoldeCoungiee"
                type="number"
                value={editForm.soldeCoungiee || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    soldeCoungiee: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog
        open={isAttendanceDialogOpen}
        onOpenChange={setIsAttendanceDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Attendance Management - {selectedEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="mark" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
              <TabsTrigger value="history">Attendance History</TabsTrigger>
            </TabsList>
            <TabsContent value="mark" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="attendanceDate" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="attendanceDate"
                    type="date"
                    value={attendanceForm.date}
                    onChange={(e) =>
                      setAttendanceForm({
                        ...attendanceForm,
                        date: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="attendanceStatus" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={attendanceForm.status}
                    onValueChange={(value: AttendanceStatus) =>
                      setAttendanceForm({ ...attendanceForm, status: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                      <SelectItem value="LATE">Late</SelectItem>
                      <SelectItem value="HALF_DAY">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {attendanceForm.status === "ABSENT" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="attendanceReason" className="text-right">
                      Reason
                    </Label>
                    <Input
                      id="attendanceReason"
                      value={attendanceForm.reason}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          reason: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Reason for absence"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAttendanceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleMarkAttendance}>Mark Attendance</Button>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "PRESENT"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.reason || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Commission Dialog */}
      <Dialog
        open={isCommissionDialogOpen}
        onOpenChange={setIsCommissionDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Commission Report - {selectedEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commissionStartDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="commissionStartDate"
                  type="date"
                  value={commissionForm.startDate}
                  onChange={(e) =>
                    setCommissionForm({
                      ...commissionForm,
                      startDate: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commissionEndDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="commissionEndDate"
                  type="date"
                  value={commissionForm.endDate}
                  onChange={(e) =>
                    setCommissionForm({
                      ...commissionForm,
                      endDate: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCalculateCommission}>
              Calculate Commission
            </Button>

            {commissionReport && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Total Commission</Label>
                        <p className="text-2xl font-bold">
                          ${commissionReport.totalCommission.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label>Commission Rate</Label>
                        <p className="text-2xl font-bold">
                          {commissionReport.commissionPercentage}%
                        </p>
                      </div>
                      <div>
                        <Label>Period</Label>
                        <p className="text-sm">
                          {new Date(
                            commissionReport.period.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            commissionReport.period.endDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Commission Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Payment Amount</TableHead>
                          <TableHead>Commission Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissionReport.commissionDetails.map(
                          (detail, index) => (
                            <TableRow key={index}>
                              <TableCell>{detail.clientName}</TableCell>
                              <TableCell>
                                ${detail.paymentAmount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${detail.commissionAmount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
