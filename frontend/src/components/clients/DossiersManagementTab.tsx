"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { dossiersAPI, clientsAPI } from "@/lib/api";
import { Dossier, Client } from "@/types";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText,
  Calendar,
  Search,
  Filter,
} from "lucide-react";

export function DossiersManagementTab() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDossier, setEditingDossier] = useState<Dossier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formData, setFormData] = useState({
    clientId: "",
    status: "EN_COURS" as "EN_COURS" | "TERMINE" | "ANNULE",
  });

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dossiersData, clientsData] = await Promise.all([
        dossiersAPI.getAll(),
        clientsAPI.getAll(),
      ]);
      setDossiers(dossiersData);
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      status: "EN_COURS",
    });
    setEditingDossier(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (dossier: Dossier) => {
    setEditingDossier(dossier);
    setFormData({
      clientId: dossier.clientId,
      status: dossier.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    try {
      if (editingDossier) {
        await dossiersAPI.update(editingDossier.id, {
          status: formData.status,
        });
        toast.success("Dossier mis à jour avec succès");
      } else {
        await dossiersAPI.create({
          clientId: formData.clientId,
          status: formData.status,
        });
        toast.success("Dossier créé avec succès");
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving dossier:", error);
      toast.error("Erreur lors de la sauvegarde du dossier");
    }
  };

  const deleteDossier = async (dossierId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) {
      return;
    }

    try {
      await dossiersAPI.delete(dossierId);
      toast.success("Dossier supprimé avec succès");
      loadData();
    } catch (error) {
      console.error("Error deleting dossier:", error);
      toast.error("Erreur lors de la suppression du dossier");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "EN_COURS":
        return "En cours";
      case "TERMINE":
        return "Terminé";
      case "ANNULE":
        return "Annulé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_COURS":
        return "bg-blue-100 text-blue-800";
      case "TERMINE":
        return "bg-green-100 text-green-800";
      case "ANNULE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesSearch =
      dossier.client?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      dossier.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || dossier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des dossiers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Dossiers</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Dossier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDossier
                  ? "Modifier le dossier"
                  : "Créer un nouveau dossier"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clientId">Client</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clientId: value })
                  }
                  disabled={!!editingDossier}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "EN_COURS" | "TERMINE" | "ANNULE") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="TERMINE">Terminé</SelectItem>
                    <SelectItem value="ANNULE">Annulé</SelectItem>
                  </SelectContent>
                </Select>
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
                  {editingDossier ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom de client ou ID de dossier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="EN_COURS">En cours</SelectItem>
              <SelectItem value="TERMINE">Terminé</SelectItem>
              <SelectItem value="ANNULE">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Dossiers</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDossiers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun dossier trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDossiers.map((dossier) => (
                <Card key={dossier.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          Dossier #{dossier.id.slice(-8)}
                        </h3>
                        <Badge className={getStatusColor(dossier.status)}>
                          {getStatusLabel(dossier.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Client:</span>{" "}
                          {dossier.client?.fullName || "Client non trouvé"}
                        </div>
                        <div>
                          <span className="font-semibold">Créé le:</span>{" "}
                          {new Date(dossier.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-semibold">Services:</span>{" "}
                          {dossier.servicesCount || 0}
                        </div>
                        <div>
                          <span className="font-semibold">Paiements:</span>{" "}
                          {dossier.paymentsCount || 0}
                        </div>
                        {dossier.totalAmount && (
                          <div className="col-span-2">
                            <span className="font-semibold">
                              Montant total:
                            </span>{" "}
                            {dossier.totalAmount.toLocaleString()} MAD
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/clients/${dossier.clientId}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir Client
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(dossier)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDossier(dossier.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
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
