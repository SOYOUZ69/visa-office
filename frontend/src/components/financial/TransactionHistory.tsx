"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { financialAPI, dossiersAPI, employeesAPI } from "@/lib/api";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownRight, DollarSign, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  caisseId: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: string;
  amount: number;
  description: string;
  reference?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  transactionDate: string;
  caisse: {
    name: string;
    type: string;
  };
  payment?: {
    dossier: {
      dossierId: string;
    };
  };
  dossier?: {
    dossierId: string;
    client: {
      fullName: string;
    };
  };
  employee?: {
    fullName: string;
  };
}

const transactionTypeColors = {
  INCOME: "text-green-600",
  EXPENSE: "text-red-600",
  TRANSFER: "text-blue-600",
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [caisses, setCaisses] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    caisseId: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    category: "none",
    amount: 0,
    description: "",
    reference: "",
    addToVirtualCaisse: false,
    dossierId: "none",
    employeeId: "none",
  });

  const [dossiers, setDossiers] = useState<
    Array<{
      id: string;
      dossierId: string;
      client: { fullName: string };
    }>
  >([]);
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      fullName: string;
    }>
  >([]);

  useEffect(() => {
    loadTransactions();
    loadCaisses();
    loadDossiers();
    loadEmployees();
  }, []);

  const loadCaisses = async () => {
    try {
      const data = await financialAPI.getCaisses();
      setCaisses(data);
    } catch (error) {
      console.error("Error loading caisses:", error);
    }
  };

  const loadDossiers = async () => {
    try {
      const data = await dossiersAPI.getAll();
      setDossiers(data);
    } catch (error) {
      console.error("Error loading dossiers:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeesAPI.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await financialAPI.getTransactions();
      setTransactions(data);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals excluding virtual caisse (only cash and bank account caisses)
  const totalIncome = transactions
    .filter(
      (t) =>
        t.type === "INCOME" &&
        t.status === "APPROVED" &&
        t.caisse.type !== "VIRTUAL"
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        t.status === "APPROVED" &&
        t.caisse.type !== "VIRTUAL"
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate tax from virtual caisse only (all virtual caisse expenses)
  const virtualCaisseTax = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        t.status === "APPROVED" &&
        t.caisse.type === "VIRTUAL"
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const resetForm = () => {
    setFormData({
      caisseId: "",
      type: "EXPENSE",
      category: "none",
      amount: 0,
      description: "",
      reference: "",
      addToVirtualCaisse: false,
      dossierId: "none",
      employeeId: "none",
    });
  };

  // Get the currently selected caisse for UI logic
  const selectedCaisse = caisses.find(
    (caisse) => caisse.id === formData.caisseId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.caisseId || !formData.amount || !formData.description) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Create main transaction
      const mainTransaction = await financialAPI.createTransaction({
        caisseId: formData.caisseId,
        type: formData.type,
        category:
          formData.category === "none"
            ? undefined
            : formData.category || undefined,
        amount: formData.amount,
        description: formData.description,
        reference: formData.reference || undefined,
        transactionDate: new Date().toISOString(),
        dossierId:
          formData.dossierId === "none"
            ? undefined
            : formData.dossierId || undefined,
        employeeId:
          formData.employeeId === "none"
            ? undefined
            : formData.employeeId || undefined,
      });

      // Create virtual caisse transaction if:
      // 1. addToVirtualCaisse is checked, OR
      // 2. the selected caisse is a bank account
      const shouldCreateVirtualTransaction =
        formData.addToVirtualCaisse ||
        (selectedCaisse && selectedCaisse.type === "BANK_ACCOUNT");

      if (shouldCreateVirtualTransaction) {
        const virtualCaisse = caisses.find(
          (caisse) => caisse.type === "VIRTUAL"
        );
        if (virtualCaisse) {
          await financialAPI.createTransaction({
            caisseId: virtualCaisse.id,
            type: formData.type,
            category:
              formData.category === "none"
                ? undefined
                : formData.category || undefined,
            amount: formData.amount,
            description: `${formData.description} (Virtuel)`,
            reference: formData.reference || undefined,
            transactionDate: new Date().toISOString(),
            dossierId:
              formData.dossierId === "none"
                ? undefined
                : formData.dossierId || undefined,
            employeeId:
              formData.employeeId === "none"
                ? undefined
                : formData.employeeId || undefined,
          });
        }
      }

      toast.success("Transaction créée avec succès");
      setDialogOpen(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Erreur lors de la création de la transaction");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Historique des Transactions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="caisseId">Caisse</Label>
                <Select
                  value={formData.caisseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, caisseId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une caisse" />
                  </SelectTrigger>
                  <SelectContent>
                    {caisses.map((caisse) => (
                      <SelectItem key={caisse.id} value={caisse.id}>
                        {caisse.name} ({caisse.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "INCOME" | "EXPENSE") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Revenu</SelectItem>
                    <SelectItem value="EXPENSE">Dépense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Catégorie (optionnel)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune catégorie</SelectItem>
                    <SelectItem value="OFFICE_RENT">Loyer de bureau</SelectItem>
                    <SelectItem value="UTILITIES">Services publics</SelectItem>
                    <SelectItem value="SALARIES">Salaires</SelectItem>
                    <SelectItem value="COMMISSIONS">Commissions</SelectItem>
                    <SelectItem value="OFFICE_SUPPLIES">
                      Fournitures de bureau
                    </SelectItem>
                    <SelectItem value="INSURANCE">Assurance</SelectItem>
                    <SelectItem value="LEGAL_FEES">Frais juridiques</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="TRAVEL">Voyage</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Montant (MAD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  placeholder="1000"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description de la transaction..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="reference">Référence (optionnel)</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Numéro de facture, etc."
                />
              </div>

              <div>
                <Label htmlFor="dossierId">Dossier (optionnel)</Label>
                <Select
                  value={formData.dossierId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dossierId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un dossier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun dossier</SelectItem>
                    {dossiers.map((dossier) => (
                      <SelectItem key={dossier.id} value={dossier.id}>
                        {dossier.dossierId}
                        {dossier.client && <> - {dossier.client.fullName}</>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.category === "SALARIES" ||
                formData.category === "COMMISSIONS") && (
                <div>
                  <Label htmlFor="employeeId">Employé</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employeeId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun employé</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addToVirtualCaisse"
                  checked={
                    formData.addToVirtualCaisse ||
                    (selectedCaisse && selectedCaisse.type === "BANK_ACCOUNT")
                  }
                  disabled={
                    selectedCaisse && selectedCaisse.type === "BANK_ACCOUNT"
                  }
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      addToVirtualCaisse: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="addToVirtualCaisse">
                  Ajouter à la caisse virtuelle
                </Label>
                <p className="text-xs text-muted-foreground ml-2">
                  (Automatique pour les comptes bancaires)
                </p>
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
                <Button type="submit">Créer la transaction</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-xs text-muted-foreground">
                  (Cash + Bancaire)
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Dépenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-xs text-muted-foreground">
                  (Cash + Bancaire)
                </p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Taxes (Virtuel)
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(virtualCaisseTax)}
                </p>
                <p className="text-xs text-muted-foreground">
                  (Dépenses Caisse Virtuelle)
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Solde Net</p>
                <p
                  className={`text-2xl font-bold ${
                    totalIncome - totalExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
                <p className="text-xs text-muted-foreground">
                  (Revenus - Dépenses)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune transaction trouvée
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Les transactions apparaîtront ici quand vous créerez des
                paiements
              </p>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => {
            const isVirtualCaisse = transaction.caisse.type === "VIRTUAL";

            return (
              <Card
                key={transaction.id}
                className={`${
                  isVirtualCaisse
                    ? "border-2 border-purple-300 bg-purple-50/50 shadow-md"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {transaction.type === "INCOME" ? (
                        <ArrowUpRight
                          className={`w-5 h-5 ${
                            isVirtualCaisse
                              ? "text-purple-600"
                              : "text-green-600"
                          }`}
                        />
                      ) : (
                        <ArrowDownRight
                          className={`w-5 h-5 ${
                            isVirtualCaisse ? "text-purple-600" : "text-red-600"
                          }`}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          {isVirtualCaisse && (
                            <Badge
                              variant="outline"
                              className="text-purple-700 border-purple-300 bg-purple-100 text-xs"
                            >
                              VIRTUEL
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            isVirtualCaisse
                              ? "text-purple-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {transaction.caisse.name} •{" "}
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleDateString("fr-FR")}
                        </p>
                        {transaction.payment && (
                          <p className="text-sm text-muted-foreground">
                            Dossier: {transaction.payment.dossier.dossierId}
                          </p>
                        )}
                        {transaction.dossier && !transaction.payment && (
                          <p className="text-sm text-muted-foreground">
                            Dossier: {transaction.dossier.dossierId}
                            {transaction.dossier.client && (
                              <> - {transaction.dossier.client.fullName}</>
                            )}
                          </p>
                        )}
                        {transaction.employee && (
                          <p className="text-sm text-muted-foreground">
                            Employé: {transaction.employee.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isVirtualCaisse
                            ? "text-purple-700"
                            : transactionTypeColors[transaction.type]
                        }`}
                      >
                        {transaction.type === "EXPENSE" ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={statusColors[transaction.status]}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
