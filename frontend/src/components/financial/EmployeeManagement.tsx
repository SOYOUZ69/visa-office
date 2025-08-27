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
import { Checkbox } from "@/components/ui/checkbox";
import { employeesAPI, financialAPI } from "@/lib/api";
import { toast } from "sonner";
import { CalendarIcon, Calculator, Check, DollarSign } from "lucide-react";

interface Employee {
  id: string;
  fullName: string;
  email?: string;
  department?: string;
  hireDate?: string;
  salaryType: "MONTHLY" | "CLIENTCOMMISSION" | "PERIODCOMMISSION";
  salaryAmount: number;
  commissionPercentage: string;
  soldeCoungiee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  calculatedCommission?: number;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    hireDate: "",
    salaryType: "MONTHLY" as
      | "MONTHLY"
      | "CLIENTCOMMISSION"
      | "PERIODCOMMISSION",
    salaryAmount: "",
    commissionPercentage: "",
    soldeCoungiee: "0",
    isActive: true,
  });

  // Salary processing state
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [processingEmployee, setProcessingEmployee] = useState<Employee | null>(
    null
  );
  const [caisses, setCaisses] = useState<any[]>([]);
  const [salaryFormData, setSalaryFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    caisseId: "",
    addToVirtualCaisse: false,
  });
  const [salaryStatus, setSalaryStatus] = useState<any>(null);

  useEffect(() => {
    loadEmployees();
    loadCaisses();
  }, []);

  const loadCaisses = async () => {
    try {
      const data = await financialAPI.getCaisses();
      setCaisses(data);
    } catch (error) {
      console.error("Error loading caisses:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesAPI.getAll();
      console.log(data);
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
      email: "",
      department: "",
      hireDate: "",
      salaryType: "MONTHLY",
      salaryAmount: "",
      commissionPercentage: "",
      soldeCoungiee: "0",
      isActive: true,
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
      email: employee.email || "",
      department: employee.department || "",
      hireDate: employee.hireDate
        ? new Date(employee.hireDate).toISOString().split("T")[0]
        : "",
      salaryType: employee.salaryType,
      salaryAmount: employee.salaryAmount.toString(),
      commissionPercentage: employee.commissionPercentage,
      soldeCoungiee: employee.soldeCoungiee.toString(),
      isActive: employee.isActive,
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
        email: formData.email || undefined,
        department: formData.department || undefined,
        hireDate: formData.hireDate || undefined,
        salaryType: formData.salaryType,
        salaryAmount: parseFloat(formData.salaryAmount),
        commissionPercentage: formData.commissionPercentage,
        soldeCoungiee: parseFloat(formData.soldeCoungiee),
        isActive: formData.isActive,
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
  const calculateCommission = async (
    employeeId: string,
    paymentId: string,
    clientId: string,
    paymentAmount: number
  ) => {
    try {
      const data = await employeesAPI.createCommission(
        employeeId,
        paymentId,
        clientId,
        paymentAmount
      );
      toast.success("Commission créée avec succès");
      loadEmployees();
    } catch (error) {
      console.error("Error creating commission:", error);
      toast.error("Erreur lors de la création de la commission");
    }
  };
  const handleCalculateCommission = async (employee: Employee) => {
    try {
      const result = await employeesAPI.calculateCommission(employee.id);
      const commissionAmount = result.totalCommission || 0;

      // Update the employee in the list with the calculated commission
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === employee.id
            ? { ...emp, calculatedCommission: commissionAmount }
            : emp
        )
      );
    } catch (error) {
      console.error("Error calculating commission:", error);
      toast.error("Erreur lors du calcul de la commission");
    }
  };
  const handleProcessCommission = async (employee: Employee) => {
    try {
      const result = await employeesAPI.processCommission(employee.id);
      toast.success("Commission traitée avec succès");
      loadEmployees();
    } catch (error) {
      console.error("Error processing commission:", error);
      toast.error("Erreur lors du traitement de la commission");
    }
  };

  const checkSalaryStatus = async (
    employeeId: string,
    month: number,
    year: number
  ) => {
    try {
      const status = await employeesAPI.getSalaryStatus(
        employeeId,
        month,
        year
      );
      setSalaryStatus(status);
      return status;
    } catch (error) {
      console.error("Error checking salary status:", error);
      setSalaryStatus(null);
      return null;
    }
  };

  const openSalaryDialog = async (employee: Employee) => {
    setProcessingEmployee(employee);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    setSalaryFormData({
      month: currentMonth,
      year: currentYear,
      caisseId: "",
      addToVirtualCaisse: false,
    });

    // Check salary status for current month/year
    await checkSalaryStatus(employee.id, currentMonth, currentYear);
    setSalaryDialogOpen(true);
  };

  const handleProcessSalary = async () => {
    if (!processingEmployee) return;

    try {
      const result = await employeesAPI.processSalary(
        processingEmployee.id,
        salaryFormData.month,
        salaryFormData.year,
        {
          caisseId: salaryFormData.caisseId || undefined,
          addToVirtualCaisse: salaryFormData.addToVirtualCaisse,
        }
      );

      toast.success("Salaire traité avec succès");
      setSalaryDialogOpen(false);
      setProcessingEmployee(null);
      setSalaryStatus(null);
      loadEmployees();
    } catch (error) {
      console.error("Error processing salary:", error);
      toast.error("Erreur lors du traitement du salaire");
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Département"
                />
              </div>

              <div>
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) =>
                    setFormData({ ...formData, hireDate: e.target.value })
                  }
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label htmlFor="isActive">Employé actif</Label>
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
                          <span className="font-semibold">Email:</span>{" "}
                          {employee.email || "Non spécifié"}
                        </div>
                        <div>
                          <span className="font-semibold">Département:</span>{" "}
                          {employee.department || "Non spécifié"}
                        </div>
                        <div>
                          <span className="font-semibold">
                            Date d'embauche:
                          </span>{" "}
                          {employee.hireDate
                            ? new Date(employee.hireDate).toLocaleDateString()
                            : "Non spécifiée"}
                        </div>
                        <div>
                          <span className="font-semibold">Statut:</span>{" "}
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              employee.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {employee.isActive ? "Actif" : "Inactif"}
                          </span>
                        </div>
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
                        {employee.calculatedCommission !== undefined && (
                          <div className="col-span-2">
                            <span className="font-semibold text-green-600">
                              Commission calculée:
                            </span>{" "}
                            {employee.calculatedCommission.toLocaleString()} MAD
                          </div>
                        )}
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
                        variant="secondary"
                        onClick={() => handleCalculateCommission(employee)}
                        className="flex items-center gap-1"
                      >
                        <Calculator className="h-4 w-4" />
                        Commission
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleProcessCommission(employee)}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Processer Commission
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openSalaryDialog(employee)}
                        className="flex items-center gap-1"
                      >
                        <DollarSign className="h-4 w-4" />
                        Traiter Salaire
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

      {/* Salary Processing Dialog */}
      <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Traiter le salaire - {processingEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Salary Status Display */}
            {salaryStatus && (
              <div
                className={`p-3 rounded-md ${
                  salaryStatus.isProcessed
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      salaryStatus.isProcessed
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <span className="font-medium">
                    {salaryStatus.isProcessed
                      ? `Salaire déjà traité pour ${salaryStatus.month}/${salaryStatus.year}`
                      : `Salaire non traité pour ${salaryStatus.month}/${salaryStatus.year}`}
                  </span>
                </div>
                {salaryStatus.salaryPayment && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      Montant:{" "}
                      {salaryStatus.salaryPayment.totalAmount.toLocaleString()}{" "}
                      MAD
                    </p>
                    <p>
                      Traité le:{" "}
                      {new Date(
                        salaryStatus.salaryPayment.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Mois</Label>
                <Select
                  value={salaryFormData.month.toString()}
                  onValueChange={async (value) => {
                    const newMonth = parseInt(value);
                    setSalaryFormData({
                      ...salaryFormData,
                      month: newMonth,
                    });
                    // Check salary status for new month/year
                    if (processingEmployee) {
                      await checkSalaryStatus(
                        processingEmployee.id,
                        newMonth,
                        salaryFormData.year
                      );
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleDateString(
                            "fr-FR",
                            { month: "long" }
                          )}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Année</Label>
                <Input
                  id="year"
                  type="number"
                  value={salaryFormData.year}
                  onChange={async (e) => {
                    const newYear = parseInt(e.target.value);
                    setSalaryFormData({
                      ...salaryFormData,
                      year: newYear,
                    });
                    // Check salary status for new month/year
                    if (processingEmployee) {
                      await checkSalaryStatus(
                        processingEmployee.id,
                        salaryFormData.month,
                        newYear
                      );
                    }
                  }}
                  min={2020}
                  max={2030}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="caisse">Caisse de paiement (optionnel)</Label>
              <Select
                value={salaryFormData.caisseId}
                onValueChange={(value) =>
                  setSalaryFormData({
                    ...salaryFormData,
                    caisseId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une caisse (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {caisses
                    .filter((caisse) => caisse.type !== "VIRTUAL")
                    .map((caisse) => (
                      <SelectItem key={caisse.id} value={caisse.id}>
                        {caisse.name} (
                        {caisse.type === "CASH" ? "Cash" : "Compte Bancaire"})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="addToVirtualCaisse"
                checked={salaryFormData.addToVirtualCaisse}
                onCheckedChange={(checked) =>
                  setSalaryFormData({
                    ...salaryFormData,
                    addToVirtualCaisse: checked as boolean,
                  })
                }
              />
              <Label htmlFor="addToVirtualCaisse">
                Ajouter à la Caisse Virtuelle
              </Label>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                • Si aucune caisse n'est sélectionnée, la caisse par défaut sera
                utilisée
              </p>
              <p>
                • La transaction sera créée avec le statut "En attente" pour
                approbation
              </p>
              <p>
                • Vous pouvez toujours ajouter la transaction à la caisse
                virtuelle
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSalaryDialogOpen(false);
                setProcessingEmployee(null);
                setSalaryStatus(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleProcessSalary}
              disabled={salaryStatus?.isProcessed}
              className={
                salaryStatus?.isProcessed ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              {salaryStatus?.isProcessed
                ? "Salaire Déjà Traité"
                : "Traiter le Salaire"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
