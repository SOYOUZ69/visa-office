"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeesAPI } from "@/lib/api";
import { toast } from "sonner";

interface Employee {
  id: string;
  fullName: string;
  salaryType: "MONTHLY" | "CLIENTCOMMISSION" | "PERIODCOMMISSION";
  salaryAmount: number;
  commissionPercentage: string;
  soldeCoungiee: number;
  createdAt: string;
  updatedAt: string;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    salaryType: "MONTHLY" as const,
    salaryAmount: "",
    commissionPercentage: "",
    soldeCoungiee: "0",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesAPI.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      salaryType: "MONTHLY",
      salaryAmount: "",
      commissionPercentage: "",
      soldeCoungiee: "0",
    });
    setEditingEmployee(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      salaryType: employee.salaryType,
      salaryAmount: employee.salaryAmount.toString(),
      commissionPercentage: employee.commissionPercentage,
      soldeCoungiee: employee.soldeCoungiee.toString(),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.salaryAmount ||
      !formData.commissionPercentage
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const data = {
        fullName: formData.fullName,
        salaryType: formData.salaryType,
        salaryAmount: parseFloat(formData.salaryAmount),
        commissionPercentage: formData.commissionPercentage,
        soldeCoungiee: parseFloat(formData.soldeCoungiee),
      };

      if (editingEmployee) {
        await employeesAPI.update(editingEmployee.id, data);
        toast.success("Employé mis à jour avec succès");
      } else {
        await employeesAPI.create(data);
        toast.success("Employé créé avec succès");
      }

      setDialogOpen(false);
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Erreur lors de la sauvegarde de l'employé");
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      return;
    }

    try {
      await employeesAPI.delete(employeeId);
      toast.success("Employé supprimé avec succès");
      loadEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Erreur lors de la suppression de l'employé");
    }
  };

  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case "MONTHLY":
        return "Mensuel";
      case "CLIENTCOMMISSION":
        return "Commission par client";
      case "PERIODCOMMISSION":
        return "Commission par période";
      default:
        return type;
    }
  };

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
        <h2 className="text-2xl font-bold">Gestion des Employés</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Ajouter un employé</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Modifier l'employé" : "Ajouter un employé"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Nom complet de l'employé"
                />
              </div>

              <div>
                <Label htmlFor="salaryType">Type de salaire</Label>
                <Select
                  value={formData.salaryType}
                  onValueChange={(
                    value: "MONTHLY" | "CLIENTCOMMISSION" | "PERIODCOMMISSION"
                  ) => setFormData({ ...formData, salaryType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensuel</SelectItem>
                    <SelectItem value="CLIENTCOMMISSION">
                      Commission par client
                    </SelectItem>
                    <SelectItem value="PERIODCOMMISSION">
                      Commission par période
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="salaryAmount">Montant du salaire (MAD)</Label>
                <Input
                  id="salaryAmount"
                  type="number"
                  step="0.01"
                  value={formData.salaryAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryAmount: e.target.value })
                  }
                  placeholder="5000"
                />
              </div>

              <div>
                <Label htmlFor="commissionPercentage">
                  Pourcentage de commission (%)
                </Label>
                <Input
                  id="commissionPercentage"
                  type="text"
                  value={formData.commissionPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionPercentage: e.target.value,
                    })
                  }
                  placeholder="10"
                />
              </div>

              <div>
                <Label htmlFor="soldeCoungiee">Solde congé</Label>
                <Input
                  id="soldeCoungiee"
                  type="number"
                  step="0.01"
                  value={formData.soldeCoungiee}
                  onChange={(e) =>
                    setFormData({ ...formData, soldeCoungiee: e.target.value })
                  }
                  placeholder="0"
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
                <Button type="submit">
                  {editingEmployee ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun employé trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <Card key={employee.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{employee.fullName}</h3>
                        <Badge variant="outline">
                          {getSalaryTypeLabel(employee.salaryType)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Salaire:</span>{" "}
                          {employee.salaryAmount.toLocaleString()} MAD
                        </div>
                        <div>
                          <span className="font-semibold">Commission:</span>{" "}
                          {employee.commissionPercentage}%
                        </div>
                        <div>
                          <span className="font-semibold">Solde congé:</span>{" "}
                          {employee.soldeCoungiee.toLocaleString()} MAD
                        </div>
                        <div>
                          <span className="font-semibold">Créé le:</span>{" "}
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(employee)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
