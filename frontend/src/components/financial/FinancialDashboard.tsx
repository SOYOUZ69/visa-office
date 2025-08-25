"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Caisse, FinancialStatistics, Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";

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
  const [statistics, setStatistics] = useState<FinancialStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showStatistics, setShowStatistics] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Statistics date range
  const [statsDateRange, setStatsDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

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

  const loadStatistics = async () => {
    try {
      const data = await financialAPI.getFinancialStatistics(
        statsDateRange.startDate,
        statsDateRange.endDate
      );
      setStatistics(data);
      setShowStatistics(true);
    } catch (error) {
      toast.error("Failed to load financial statistics");
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      let startDate: Date;
      let endDate: Date;

      if (useCustomRange) {
        startDate = new Date(customDateRange.startDate);
        endDate = new Date(customDateRange.endDate);

        // Validate custom date range
        if (startDate > endDate) {
          toast.error("La date de début doit être antérieure à la date de fin");
          setGenerating(false);
          return;
        }

        if (endDate > new Date()) {
          toast.error("La date de fin ne peut pas être dans le futur");
          setGenerating(false);
          return;
        }
      } else {
        startDate = new Date();
        endDate = new Date();

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
      }

      await financialAPI.generateFinancialReport(
        startDate.toISOString(),
        endDate.toISOString()
      );
      toast.success("Financial report generated successfully");
      loadData();
    } catch (error) {
      console.error("Failed to generate financial report:", error);
      toast.error("Failed to generate financial report");
    } finally {
      setGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCurrentPeriodDisplay = () => {
    if (useCustomRange) {
      return `${new Date(customDateRange.startDate).toLocaleDateString(
        "fr-FR"
      )} - ${new Date(customDateRange.endDate).toLocaleDateString("fr-FR")}`;
    }

    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        return `${startDate.toLocaleDateString(
          "fr-FR"
        )} - ${now.toLocaleDateString("fr-FR")}`;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        return `${startDate.toLocaleDateString(
          "fr-FR"
        )} - ${now.toLocaleDateString("fr-FR")}`;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        return `${startDate.toLocaleDateString(
          "fr-FR"
        )} - ${now.toLocaleDateString("fr-FR")}`;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        return `${startDate.toLocaleDateString(
          "fr-FR"
        )} - ${now.toLocaleDateString("fr-FR")}`;
      default:
        return "";
    }
  };

  const getPeriodName = () => {
    if (useCustomRange) {
      return "Période personnalisée";
    }

    switch (selectedPeriod) {
      case "week":
        return "Cette semaine";
      case "month":
        return "Ce mois";
      case "quarter":
        return "Ce trimestre";
      case "year":
        return "Cette année";
      default:
        return "";
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
      <h2 className="text-2xl font-bold">Tableau Financier</h2>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={loadStatistics}>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Statistics
          </Button>

          {/* Report Generation Controls */}
          <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="presetPeriod"
                checked={!useCustomRange}
                onChange={() => setUseCustomRange(false)}
                className="w-4 h-4"
              />
              <label htmlFor="presetPeriod" className="text-sm font-medium">
                Période prédéfinie:
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
                disabled={useCustomRange}
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="customPeriod"
                checked={useCustomRange}
                onChange={() => setUseCustomRange(true)}
                className="w-4 h-4"
              />
              <label htmlFor="customPeriod" className="text-sm font-medium">
                Période personnalisée:
              </label>
              <Input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    startDate: e.target.value,
                  })
                }
                className="w-32 text-sm"
                disabled={!useCustomRange}
              />
              <span className="text-sm">à</span>
              <Input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    endDate: e.target.value,
                  })
                }
                className="w-32 text-sm"
                disabled={!useCustomRange}
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUseCustomRange(false);
                setSelectedPeriod("week");
              }}
              className="text-xs"
            >
              Semaine
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUseCustomRange(false);
                setSelectedPeriod("month");
              }}
              className="text-xs"
            >
              Mois
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUseCustomRange(false);
                setSelectedPeriod("quarter");
              }}
              className="text-xs"
            >
              Trimestre
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUseCustomRange(false);
                setSelectedPeriod("year");
              }}
              className="text-xs"
            >
              Année
            </Button>
          </div>

          <Button onClick={generateReport} disabled={generating}>
            <Calculator className="w-4 h-4 mr-2" />
            {generating ? "Génération..." : "Générer Rapport"}
          </Button>
        </div>

        {/* Current Period Display */}
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {getPeriodName()}:
            </span>
            <span className="text-sm text-blue-700">
              {getCurrentPeriodDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {showStatistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Financial Statistics (Approved Transactions Only)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatistics(false)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date Range Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="statsStartDate">Start Date</Label>
                  <Input
                    id="statsStartDate"
                    type="date"
                    value={statsDateRange.startDate}
                    onChange={(e) =>
                      setStatsDateRange({
                        ...statsDateRange,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="statsEndDate">End Date</Label>
                  <Input
                    id="statsEndDate"
                    type="date"
                    value={statsDateRange.endDate}
                    onChange={(e) =>
                      setStatsDateRange({
                        ...statsDateRange,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={loadStatistics}>Update Statistics</Button>

              {statistics && (
                <div className="space-y-6">
                  {/* Statistics Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Revenue
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(statistics.revenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From approved transactions only
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Expenses
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(statistics.expenses)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From approved transactions only
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Net Profit
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div
                          className={`text-2xl font-bold ${
                            statistics.netProfit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(statistics.netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Revenue - Expenses
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Transactions
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {statistics.transactionCounts.total}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {statistics.transactionCounts.approved} approved,{" "}
                          {statistics.transactionCounts.pending} pending
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Transaction Status Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>
                            Approved: {statistics.transactionCounts.approved}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span>
                            Pending: {statistics.transactionCounts.pending}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>
                            Rejected: {statistics.transactionCounts.rejected}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span>
                            Total: {statistics.transactionCounts.total}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Transactions Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        All Transactions (Including Pending/Rejected)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Client</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statistics.transactions
                            .slice(0, 10)
                            .map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  {new Date(
                                    transaction.transactionDate
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {transaction.description}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      transaction.type === "INCOME"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {transaction.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(transaction.amount)}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(transaction.status)}
                                </TableCell>
                                <TableCell>
                                  {transaction.payment?.client?.fullName || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      {statistics.transactions.length > 10 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Showing first 10 transactions. Total:{" "}
                          {statistics.transactions.length}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
              {formatCurrency(totalCaisseBalance)}
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

      {/* Rest of the existing dashboard content remains the same */}
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
                  {formatCurrency(latestReport.totalIncome)}
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
                  {formatCurrency(latestReport.totalExpenses)}
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
                  {formatCurrency(latestReport.totalTax)}
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
                  {formatCurrency(latestReport.netProfit)}
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
                          {formatCurrency(caisse.balance)}
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
