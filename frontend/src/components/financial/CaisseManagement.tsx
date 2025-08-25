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
import { Badge } from "@/components/ui/badge";
import { financialAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  Plus,
  DollarSign,
  CreditCard,
  PiggyBank,
  Edit,
  Trash2,
} from "lucide-react";
import { Caisse } from "@/types";

const caisseTypeIcons = {
  VIRTUAL: PiggyBank,
  CASH: DollarSign,
  BANK_ACCOUNT: CreditCard,
};

const caisseTypeLabels = {
  VIRTUAL: "Caisse Virtuelle",
  CASH: "Caisse (Cash)",
  BANK_ACCOUNT: "Compte Bancaire",
};

export function CaisseManagement() {
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCaisse, setEditingCaisse] = useState<Caisse | null>(null);
  const [newCaisse, setNewCaisse] = useState({
    name: "",
    type: "CASH" as const,
    description: "",
  });

  useEffect(() => {
    loadCaisses();
  }, []);

  const loadCaisses = async () => {
    try {
      const data = await financialAPI.getCaisses();
      setCaisses(data);
    } catch (error) {
      toast.error("Failed to load caisses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCaisse = async () => {
    try {
      await financialAPI.createCaisse(newCaisse);
      toast.success("Caisse created successfully");
      setIsDialogOpen(false);
      setNewCaisse({ name: "", type: "CASH", description: "" });
      loadCaisses();
    } catch (error) {
      toast.error("Failed to create caisse");
    }
  };

  const handleEditCaisse = async () => {
    if (!editingCaisse) return;

    try {
      await financialAPI.updateCaisse(editingCaisse.id, editingCaisse);
      toast.success("Caisse updated successfully");
      setIsDialogOpen(false);
      setEditingCaisse(null);
      loadCaisses();
    } catch (error) {
      toast.error("Failed to update caisse");
    }
  };

  const handleDeleteCaisse = async (caisseId: string) => {
    if (!confirm("Are you sure you want to delete this caisse?")) return;

    try {
      await financialAPI.deleteCaisse(caisseId);
      toast.success("Caisse deleted successfully");
      loadCaisses();
    } catch (error) {
      toast.error("Failed to delete caisse");
    }
  };

  const openEditDialog = (caisse: Caisse) => {
    setEditingCaisse(caisse);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCaisse(null);
    setNewCaisse({ name: "", type: "CASH", description: "" });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading caisses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Caisses</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Caisse
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caisses.map((caisse) => {
          const IconComponent = caisseTypeIcons[caisse.type];
          return (
            <Card key={caisse.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {caisse.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(caisse)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCaisse(caisse.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(caisse.balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {caisseTypeLabels[caisse.type]}
                </p>
                {caisse.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {caisse.description}
                  </p>
                )}
                <Badge
                  variant={caisse.isActive ? "default" : "secondary"}
                  className="mt-2"
                >
                  {caisse.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCaisse
                ? "Modifier la Caisse"
                : "Créer une nouvelle caisse"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de la caisse</Label>
              <Input
                id="name"
                value={editingCaisse ? editingCaisse.name : newCaisse.name}
                onChange={(e) => {
                  if (editingCaisse) {
                    setEditingCaisse({
                      ...editingCaisse,
                      name: e.target.value,
                    });
                  } else {
                    setNewCaisse({ ...newCaisse, name: e.target.value });
                  }
                }}
                placeholder="Ex: Caisse Principale"
              />
            </div>
            <div>
              <Label htmlFor="type">Type de caisse</Label>
              <Select
                value={editingCaisse ? editingCaisse.type : newCaisse.type}
                onValueChange={(value: any) => {
                  if (editingCaisse) {
                    setEditingCaisse({ ...editingCaisse, type: value });
                  } else {
                    setNewCaisse({ ...newCaisse, type: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIRTUAL">Caisse Virtuelle</SelectItem>
                  <SelectItem value="CASH">Caisse (Cash)</SelectItem>
                  <SelectItem value="BANK_ACCOUNT">Compte Bancaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={
                  editingCaisse
                    ? editingCaisse.description || ""
                    : newCaisse.description
                }
                onChange={(e) => {
                  if (editingCaisse) {
                    setEditingCaisse({
                      ...editingCaisse,
                      description: e.target.value,
                    });
                  } else {
                    setNewCaisse({ ...newCaisse, description: e.target.value });
                  }
                }}
                placeholder="Description optionnelle"
              />
            </div>
            <Button
              onClick={editingCaisse ? handleEditCaisse : handleCreateCaisse}
              className="w-full"
            >
              {editingCaisse ? "Modifier la caisse" : "Créer la caisse"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
