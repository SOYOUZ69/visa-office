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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { financialAPI } from "@/lib/api";
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
    client: {
      fullName: string;
    };
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
    category: "",
    amount: 0,
    description: "",
    reference: "",
  });

  useEffect(() => {
    loadTransactions();
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

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME" && t.status === "APPROVED")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE" && t.status === "APPROVED")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const resetForm = () => {
    setFormData({
      caisseId: "",
      type: "EXPENSE",
      category: "",
      amount: 0,
      description: "",
      reference: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.caisseId || !formData.amount || !formData.description) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await financialAPI.createTransaction({
        caisseId: formData.caisseId,
        type: formData.type,
        category: formData.category || undefined,
        amount: formData.amount,
        description: formData.description,
        reference: formData.reference || undefined,
        transactionDate: new Date().toISOString(),
      });

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
                    <SelectItem value="OFFICE_RENT">Loyer de bureau</SelectItem>
                    <SelectItem value="UTILITIES">Services publics</SelectItem>
                    <SelectItem value="SALARIES">Salaires</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
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
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-600" />
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
          transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {transaction.type === "INCOME" ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.caisse.name} •{" "}
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString("fr-FR")}
                      </p>
                      {transaction.payment && (
                        <p className="text-sm text-muted-foreground">
                          Client: {transaction.payment.client.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transactionTypeColors[transaction.type]
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
          ))
        )}
      </div>
    </div>
  );
}
