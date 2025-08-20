'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Plus, FolderOpen, Calendar, DollarSign, Package, CreditCard, CheckCircle2 } from 'lucide-react'
import { Dossier, DossierStatus } from '@/types'
import { dossiersAPI } from '@/lib/api'
import { toast } from 'sonner'
import useSWR from 'swr'

interface DossiersListProps {
  clientId: string
  clientName: string
  onDossierSelect?: (dossier: Dossier | null) => void
}

const statusColors: Record<DossierStatus, string> = {
  'EN_COURS': 'bg-blue-500',
  'TERMINE': 'bg-green-500',
  'ANNULE': 'bg-red-500',
}

const statusLabels: Record<DossierStatus, string> = {
  'EN_COURS': 'En cours',
  'TERMINE': 'Terminé',
  'ANNULE': 'Annulé',
}

export function DossiersList({ clientId, clientName, onDossierSelect }: DossiersListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null)
  
  const { data: dossiers, mutate } = useSWR(
    `/dossiers/${clientId}`,
    () => dossiersAPI.getByClient(clientId),
    {
      revalidateOnFocus: false,
    }
  )

  // Logique de sélection automatique
  useEffect(() => {
    if (dossiers && dossiers.length > 0 && !selectedDossierId) {
      // Si un seul dossier, le sélectionner
      // Si plusieurs dossiers, sélectionner le plus récent (premier dans la liste car trié par date desc)
      const dossierToSelect = dossiers[0];
      setSelectedDossierId(dossierToSelect.id);
      if (onDossierSelect) {
        onDossierSelect(dossierToSelect);
      }
    } else if (dossiers && dossiers.length === 0) {
      setSelectedDossierId(null);
      if (onDossierSelect) {
        onDossierSelect(null);
      }
    }
  }, [dossiers, selectedDossierId, onDossierSelect])

  const handleDossierSelection = (dossierId: string) => {
    setSelectedDossierId(dossierId);
    const selectedDossier = dossiers?.find(d => d.id === dossierId);
    if (selectedDossier && onDossierSelect) {
      onDossierSelect(selectedDossier);
    }
  }

  const handleCreateDossier = async () => {
    try {
      setIsCreating(true)
      const newDossier = await dossiersAPI.create({ clientId })
      await mutate() // Refresh the list
      
      // Sélectionner automatiquement le nouveau dossier
      setSelectedDossierId(newDossier.id);
      if (onDossierSelect) {
        onDossierSelect(newDossier);
      }
      
      toast.success('Nouveau dossier créé avec succès')
    } catch (error) {
      console.error('Error creating dossier:', error)
      toast.error('Erreur lors de la création du dossier')
    } finally {
      setIsCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAmount = (amount?: number) => {
    if (!amount) return '0,00 €'
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Dossiers de {clientName}
            </CardTitle>
            <CardDescription>
              {dossiers && dossiers.length > 0 && (
                <span className="text-sm text-blue-600">
                  Dossier actif : #{selectedDossierId?.slice(-8).toUpperCase()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button onClick={handleCreateDossier} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Création...' : 'Nouveau dossier'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!dossiers || dossiers.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun dossier
            </h3>
            <p className="text-gray-500 mb-4">
              Ce client n&apos;a pas encore de dossier.
            </p>
            <Button onClick={handleCreateDossier} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Création...' : 'Créer le premier dossier'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sélecteur de dossier */}
            {dossiers.length > 1 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium mb-3 block">
                  Sélectionner un dossier actif :
                </Label>
                <RadioGroup 
                  value={selectedDossierId || ''} 
                  onValueChange={handleDossierSelection}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dossiers.map((dossier: Dossier) => (
                      <div key={dossier.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={dossier.id} id={dossier.id} />
                        <Label 
                          htmlFor={dossier.id} 
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <span className="font-medium">
                            #{dossier.id.slice(-8).toUpperCase()}
                          </span>
                          <Badge 
                            variant="secondary"
                            className={`text-white text-xs ${statusColors[dossier.status]}`}
                          >
                            {statusLabels[dossier.status]}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(dossier.createdAt)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Liste des dossiers */}
            <div className="grid gap-4">
              {dossiers.map((dossier: Dossier) => (
                <Card 
                  key={dossier.id} 
                  className={`hover:shadow-md transition-all ${
                    selectedDossierId === dossier.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                      : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedDossierId === dossier.id && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          )}
                          <h4 className="font-semibold">
                            Dossier #{dossier.id.slice(-8).toUpperCase()}
                          </h4>
                          <Badge 
                            variant="secondary"
                            className={`text-white ${statusColors[dossier.status]}`}
                          >
                            {statusLabels[dossier.status]}
                          </Badge>
                          {selectedDossierId === dossier.id && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                              Actif
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Créé le {formatDate(dossier.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{dossier.servicesCount || 0} service(s)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            <span>{dossier.paymentsCount || 0} paiement(s)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatAmount(dossier.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {dossiers.length > 1 && selectedDossierId !== dossier.id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDossierSelection(dossier.id)}
                          >
                            Sélectionner
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Voir détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                Détails du Dossier #{dossier.id.slice(-8).toUpperCase()}
                              </DialogTitle>
                              <DialogDescription>
                                Consultez et gérez les services et paiements de ce dossier.
                              </DialogDescription>
                            </DialogHeader>
                            <DossierDetails dossierId={dossier.id} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DossierDetails({ dossierId }: { dossierId: string }) {
  const { data: dossier } = useSWR(
    `/dossier/${dossierId}`,
    () => dossiersAPI.getById(dossierId)
  )

  if (!dossier) {
    return <div>Chargement...</div>
  }

  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="payments">Paiements</TabsTrigger>
      </TabsList>
      
      <TabsContent value="services" className="mt-4">
        <div className="space-y-2">
          {dossier.serviceItems && dossier.serviceItems.length > 0 ? (
            dossier.serviceItems.map((service: any) => (
              <Card key={service.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{service.serviceType}</p>
                      <p className="text-sm text-gray-600">
                        Quantité: {service.quantity} × {parseFloat(service.unitPrice).toFixed(2)}€
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {(service.quantity * parseFloat(service.unitPrice)).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun service dans ce dossier</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="payments" className="mt-4">
        <div className="space-y-2">
          {dossier.payments && dossier.payments.length > 0 ? (
            dossier.payments.map((payment: any) => (
              <Card key={payment.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        Paiement {payment.paymentModality}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.installments?.length || 0} échéance(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {parseFloat(payment.totalAmount).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun paiement dans ce dossier</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}