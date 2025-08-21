"use client"
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { financialAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Calculator,
  BarChart3,
  Calendar,
  Download,
} from "lucide-react";
import { Caisse } from "@/types";

interface FinancialReport {
  id: string;
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpenses: number;
  totalTax: number;
  netProfit: number;
  caisseBalances: Record<string, any>;
}

export function FinancialDashboard() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportsData, caissesData] = await Promise.all([
        financialAPI.getFinancialReports(),
        financialAPI.getCaisses(),
      ]);
      setReports(reportsData);
      setCaisses(caissesData);
    } catch (error) {
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const startDate = new Date();
      const endDate = new Date();

      switch (selectedPeriod) {
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      await financialAPI.generateFinancialReport(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );
      toast.success("Financial report generated successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to generate financial report");
    } finally {
      setGenerating(false);
    }
  };

  const latestReport = reports[0];

  // Calculate current totals from caisses
  const totalCaisseBalance = caisses.reduce(
    (sum, caisse) => sum + parseFloat(caisse.balance),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading financial dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tableau Financier</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <Button onClick={generateReport} disabled={generating}>
            <Calculator className="w-4 h-4 mr-2" />
            {generating ? "Génération..." : "Générer Rapport"}
          </Button>
        </div>
      </div>

      {/* Current Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solde Total des Caisses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalCaisseBalance.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Solde actuel de toutes les caisses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre de Caisses
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {caisses.length}
            </div>
            <p className="text-xs text-muted-foreground">Caisses actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernier Rapport
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {latestReport
                ? new Date(latestReport.reportDate).toLocaleDateString("fr-FR")
                : "Aucun"}
            </div>
            <p className="text-xs text-muted-foreground">
              Date du dernier rapport
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports Générés
            </CardTitle>
            <Download className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports.length}
            </div>
            <p className="text-xs text-muted-foreground">Total des rapports</p>
          </CardContent>
        </Card>
      </div>

      {latestReport && (
        <>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenus Totaux
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {latestReport.totalIncome.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Période:{" "}
                  {new Date(latestReport.periodStart).toLocaleDateString(
                    "fr-FR"
                  )}{" "}
                  -{" "}
                  {new Date(latestReport.periodEnd).toLocaleDateString("fr-FR")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dépenses Totales
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {latestReport.totalExpenses.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Toutes les dépenses de l'office
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxes (19%)
                </CardTitle>
                <Receipt className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {latestReport.totalTax.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  19% sur les revenus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bénéfice Net
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    latestReport.netProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {latestReport.netProfit.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenus - Dépenses - Taxes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Caisse Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Soldes des Caisses (Dernier Rapport)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(latestReport.caisseBalances).map(
                  ([caisseId, caisse]: [string, any]) => (
                    <div
                      key={caisseId}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{caisse.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {caisse.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {caisse.balance.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Marge Bénéficiaire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {latestReport.totalIncome > 0
                    ? (
                        (latestReport.netProfit / latestReport.totalIncome) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Pourcentage de bénéfice sur les revenus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ratio Dépenses/Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {latestReport.totalIncome > 0
                    ? (
                        (latestReport.totalExpenses /
                          latestReport.totalIncome) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Pourcentage des dépenses par rapport aux revenus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficacité Fiscale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {latestReport.totalIncome > 0
                    ? (
                        (latestReport.totalTax / latestReport.totalIncome) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Pourcentage des taxes par rapport aux revenus
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!latestReport && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucun rapport financier disponible
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Générez votre premier rapport financier pour voir les statistiques
              détaillées
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
