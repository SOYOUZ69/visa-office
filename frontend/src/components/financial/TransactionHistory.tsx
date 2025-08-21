"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { financialAPI } from "@/lib/api";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";

interface Transaction {
  id: string;
  caisseId: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: string;
  amount: number;
  description: string;
  reference?: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
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
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

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
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalIncome.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
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
                  {totalExpenses.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
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
                  {(totalIncome - totalExpenses).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
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
                      {transaction.amount.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
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
