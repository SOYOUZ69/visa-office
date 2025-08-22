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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { financialAPI } from "@/lib/api";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  transactionDate: string;
  createdAt: string;
  caisse: {
    name: string;
  };
  payment?: {
    client: {
      fullName: string;
    };
  };
}

export function TransactionApproval() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    loadPendingTransactions();
  }, []);

  const loadPendingTransactions = async () => {
    try {
      setLoading(true);
      const data = await financialAPI.getPendingTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading pending transactions:", error);
      toast.error("Erreur lors du chargement des transactions en attente");
    } finally {
      setLoading(false);
    }
  };

  const approveTransaction = async (transactionId: string) => {
    try {
      await financialAPI.approveTransaction(transactionId, "admin"); // This should come from auth context
      toast.success("Transaction approuvée avec succès");
      loadPendingTransactions();
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast.error("Erreur lors de l'approbation de la transaction");
    }
  };

  const rejectTransaction = async () => {
    if (!selectedTransaction || !rejectionReason.trim()) {
      toast.error("Veuillez fournir une raison de rejet");
      return;
    }

    try {
      await financialAPI.rejectTransaction(
        selectedTransaction.id,
        "admin", // This should come from auth context
        rejectionReason.trim()
      );
      toast.success("Transaction rejetée avec succès");
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedTransaction(null);
      loadPendingTransactions();
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      toast.error("Erreur lors du rejet de la transaction");
    }
  };

  const openRejectDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">En attente</Badge>;
      case "APPROVED":
        return <Badge variant="default">Approuvé</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "INCOME":
        return (
          <Badge variant="default" className="bg-green-500">
            Revenu
          </Badge>
        );
      case "EXPENSE":
        return <Badge variant="destructive">Dépense</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            Chargement des transactions en attente...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions en attente d'approbation</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune transaction en attente d'approbation
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(transaction.type)}
                        {getStatusBadge(transaction.status)}
                      </div>
                      <h3 className="font-semibold">
                        {transaction.description}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Caisse: {transaction.caisse.name}
                      </p>
                      {transaction.payment && (
                        <p className="text-sm text-muted-foreground">
                          Client: {transaction.payment.client.fullName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Date:{" "}
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {transaction.amount.toLocaleString()} MAD
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => approveTransaction(transaction.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(transaction)}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Raison du rejet</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Veuillez expliquer la raison du rejet..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                  setSelectedTransaction(null);
                }}
              >
                Annuler
              </Button>
              <Button variant="destructive" onClick={rejectTransaction}>
                Rejeter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
