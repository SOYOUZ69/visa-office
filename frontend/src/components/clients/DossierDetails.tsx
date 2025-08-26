import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { dossiersAPI } from "@/lib/api";
import useSWR from "swr";

export function DossierDetails({ dossierId }: { dossierId: string }) {
  const { data: dossier } = useSWR(`/dossiers/${dossierId}`, () =>
    dossiersAPI.getById(dossierId)
  );
  if (!dossier) {
    return <div>Chargement...</div>;
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
                        Quantité: {service.quantity} ×{" "}
                        {parseFloat(service.unitPrice).toFixed(2)}€
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {(
                          service.quantity * parseFloat(service.unitPrice)
                        ).toFixed(2)}
                        €
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Aucun service dans ce dossier
            </p>
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
            <p className="text-gray-500 text-center py-4">
              Aucun paiement dans ce dossier
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
