"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { api, metaAPI, servicesAPI } from "@/lib/api";
import { Loader2, Plus, Trash2 } from "lucide-react";

const phoneCallClientSchema = z
  .object({
    clientType: z.literal("PHONE_CALL"),
    fullName: z.string().min(1, "Le nom complet est requis"),
    address: z.string().min(1, "L'adresse est requise"),
    jobTitle: z.string().optional(),
    email: z.string().email("Email invalide"),
    destination: z.string().min(1, "La destination est requise"),
    visaType: z.string().min(1, "Le type de visa est requis"),
    notes: z.string().optional(),
    isMinor: z.boolean().optional().default(false),
    guardianFullName: z.string().optional(),
    guardianCIN: z.string().optional(),
    guardianRelationship: z.string().optional(),
    phoneNumbers: z
      .array(
        z.object({
          number: z.string().min(1, "Le numéro de téléphone est requis"),
        })
      )
      .min(1, "Au moins un numéro de téléphone est requis"),
    employers: z
      .array(
        z.object({
          name: z.string().min(1, "Le nom de l'employeur est requis"),
          position: z.string().optional(),
        })
      )
      .optional(),
    services: z
      .array(
        z.object({
          serviceType: z.enum([
            "TRANSLATION",
            "DOSSIER_TREATMENT",
            "ASSURANCE",
            "VISA_APPLICATION",
            "CONSULTATION",
            "OTHER",
          ]),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
        })
      )
      .min(1, "Au moins un service est requis"),
    paymentConfig: z.object({
      totalAmount: z.number().min(0),
      paymentOption: z.enum(["BANK_TRANSFER", "CHEQUE", "POST", "CASH"]),
      paymentModality: z.enum([
        "FULL_PAYMENT",
        "SIXTY_FORTY",
        "MILESTONE_PAYMENTS",
      ]),
      transferCode: z.string().optional(),
      installments: z
        .array(
          z.object({
            description: z.string().min(1),
            percentage: z.number().min(0).max(100),
            amount: z.number().min(0),
            dueDate: z.string(),
          })
        )
        .min(1),
    }),
  })
  .refine(
    (data) => {
      if (
        data.isMinor &&
        (!data.guardianFullName ||
          !data.guardianCIN ||
          !data.guardianRelationship)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Les informations du tuteur sont requises pour les mineurs",
      path: ["guardianFullName"],
    }
  );

type PhoneCallClientFormData = z.infer<typeof phoneCallClientSchema>;

interface PhoneCallClientWizardProps {
  onCancel?: () => void;
}

export function PhoneCallClientWizard({
  onCancel,
}: PhoneCallClientWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visaTypes, setVisaTypes] = useState<string[]>([]);
  const [priceLoadingStates, setPriceLoadingStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [prefilledPrices, setPrefilledPrices] = useState<{
    [key: number]: boolean;
  }>({});
  const [userModifiedPrices, setUserModifiedPrices] = useState<{
    [key: number]: boolean;
  }>({});
  const [debounceTimers, setDebounceTimers] = useState<{
    [key: number]: NodeJS.Timeout;
  }>({});

  const form = useForm<PhoneCallClientFormData>({
    resolver: zodResolver(phoneCallClientSchema),
    defaultValues: {
      clientType: "PHONE_CALL",
      fullName: "",
      address: "",
      jobTitle: "",
      email: "",
      destination: "",
      visaType: "",
      notes: "",
      isMinor: false,
      guardianFullName: "",
      guardianCIN: "",
      guardianRelationship: "",
      phoneNumbers: [{ number: "" }],
      employers: [],
      services: [
        { serviceType: "VISA_APPLICATION", quantity: 1, unitPrice: 0 },
      ],
      paymentConfig: {
        totalAmount: 0,
        paymentOption: "CASH",
        paymentModality: "FULL_PAYMENT",
        transferCode: "",
        installments: [
          {
            description: "Paiement complet",
            percentage: 100,
            amount: 0,
            dueDate: new Date().toISOString().split("T")[0],
          },
        ],
      },
    },
  });

  const watchServices = form.watch("services");
  const watchPaymentModality = form.watch("paymentConfig.paymentModality");
  const watchPaymentOption = form.watch("paymentConfig.paymentOption");

  useEffect(() => {
    loadVisaTypes();
  }, []);

  const loadVisaTypes = async () => {
    try {
      const types = await metaAPI.getVisaTypes();
      setVisaTypes(types);
    } catch (error) {
      console.error("Failed to load visa types:", error);
      // Set default visa types if API fails
      setVisaTypes([
        "Tourist",
        "Business",
        "Student",
        "Work",
        "Transit",
        "Medical",
      ]);
    }
  };

  // Calculate total amount from services
  const calculateTotalAmount = () => {
    const services = form.getValues("services");
    const total = services.reduce(
      (sum, service) => sum + service.quantity * service.unitPrice,
      0
    );
    form.setValue("paymentConfig.totalAmount", total);

    // Update installment amounts
    const installments = form.getValues("paymentConfig.installments");
    const updatedInstallments = installments.map((inst) => ({
      ...inst,
      amount: (total * inst.percentage) / 100,
    }));
    form.setValue("paymentConfig.installments", updatedInstallments);
  };

  // Debounced function to fetch last price
  const fetchLastPrice = useCallback(
    async (serviceType: string, index: number) => {
      if (!serviceType || userModifiedPrices[index]) return;

      setPriceLoadingStates((prev) => ({ ...prev, [index]: true }));

      try {
        const response = await servicesAPI.getLastPrice(serviceType);
        if (response.unitPrice !== null && !userModifiedPrices[index]) {
          form.setValue(`services.${index}.unitPrice`, response.unitPrice);
          setPrefilledPrices((prev) => ({ ...prev, [index]: true }));
          calculateTotalAmount();
        }
      } catch (error) {
        console.error("Failed to fetch last price:", error);
        // Silent error - don't show toast for price fetching failures
      } finally {
        setPriceLoadingStates((prev) => ({ ...prev, [index]: false }));
      }
    },
    [form, userModifiedPrices, calculateTotalAmount]
  );

  const handleServiceTypeChange = (value: string, index: number) => {
    form.setValue(`services.${index}.serviceType`, value);

    // Clear any existing timer for this index
    if (debounceTimers[index]) {
      clearTimeout(debounceTimers[index]);
    }

    // Set new timer
    const timer = setTimeout(() => {
      fetchLastPrice(value, index);
    }, 200);

    setDebounceTimers((prev) => ({ ...prev, [index]: timer }));
  };

  const handlePriceChange = (index: number, value: number) => {
    setUserModifiedPrices((prev) => ({ ...prev, [index]: true }));
    setPrefilledPrices((prev) => ({ ...prev, [index]: false }));
    form.setValue(`services.${index}.unitPrice`, value);
    calculateTotalAmount();
  };

  // Handle payment modality change
  const handlePaymentModalityChange = (modality: string) => {
    const totalAmount = form.getValues("paymentConfig.totalAmount");

    if (modality === "FULL_PAYMENT") {
      form.setValue("paymentConfig.installments", [
        {
          description: "Paiement complet",
          percentage: 100,
          amount: totalAmount,
          dueDate: new Date().toISOString().split("T")[0],
        },
      ]);
    } else if (modality === "SIXTY_FORTY") {
      form.setValue("paymentConfig.installments", [
        {
          description: "Premier versement (60%)",
          percentage: 60,
          amount: totalAmount * 0.6,
          dueDate: new Date().toISOString().split("T")[0],
        },
        {
          description: "Deuxième versement (40%)",
          percentage: 40,
          amount: totalAmount * 0.4,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      ]);
    }
  };

  const onSubmit = async (data: PhoneCallClientFormData) => {
    try {
      setIsSubmitting(true);

      // Validate installments sum to 100%
      const totalPercentage = data.paymentConfig.installments.reduce(
        (sum, inst) => sum + inst.percentage,
        0
      );
      if (totalPercentage !== 100) {
        toast.error("Les versements doivent totaliser 100%");
        return;
      }

      // Check if transfer code is required
      const today = new Date().toISOString().split("T")[0];
      const hasDueToday = data.paymentConfig.installments.some(
        (inst) => inst.dueDate === today
      );
      if (
        hasDueToday &&
        data.paymentConfig.paymentOption === "BANK_TRANSFER" &&
        !data.paymentConfig.transferCode
      ) {
        toast.error(
          "Le code de transfert est requis pour les virements dus aujourd&apos;hui"
        );
        return;
      }

      // Prepare data, only include guardian fields when necessary
      const submitData = { ...data };
      if (!data.isMinor) {
        delete submitData.guardianFullName;
        delete submitData.guardianCIN;
        delete submitData.guardianRelationship;
      }

      const response = await api.post("/api/v1/clients/phone-call", submitData);

      toast.success("Client Phone Call créé avec succès");
      router.push(`/clients/${response.data.id}`);
    } catch (error) {
      console.error("Error creating phone call client:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du client";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom complet *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse *</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="jobTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Poste</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>Numéros de téléphone *</FormLabel>
        {form.watch("phoneNumbers").map((_, index) => (
          <div key={index} className="flex gap-2">
            <FormField
              control={form.control}
              name={`phoneNumbers.${index}.number`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="+212612345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("phoneNumbers").length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const phoneNumbers = form.getValues("phoneNumbers");
                  form.setValue(
                    "phoneNumbers",
                    phoneNumbers.filter((_, i) => i !== index)
                  );
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const phoneNumbers = form.getValues("phoneNumbers");
            form.setValue("phoneNumbers", [...phoneNumbers, { number: "" }]);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Ajouter un numéro
        </Button>
      </div>

      <FormField
        control={form.control}
        name="destination"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Destination *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="visaType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de visa *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de visa" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {visaTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isMinor"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Mineur (moins de 18 ans)</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {form.watch("isMinor") && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-sm">
              Informations du tuteur (requis)
            </h4>

            <FormField
              control={form.control}
              name="guardianFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet du tuteur *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianCIN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CIN du tuteur *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la relation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Mother">Mère</SelectItem>
                      <SelectItem value="Father">Père</SelectItem>
                      <SelectItem value="Grandmother">Grand-mère</SelectItem>
                      <SelectItem value="Grandfather">Grand-père</SelectItem>
                      <SelectItem value="Aunt">Tante</SelectItem>
                      <SelectItem value="Uncle">Oncle</SelectItem>
                      <SelectItem value="Legal Guardian">
                        Tuteur légal
                      </SelectItem>
                      <SelectItem value="Other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <FormLabel>Services *</FormLabel>
      {form.watch("services").map((_, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name={`services.${index}.serviceType`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de service</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleServiceTypeChange(value, index);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRANSLATION">Traduction</SelectItem>
                        <SelectItem value="DOSSIER_TREATMENT">
                          Traitement de dossier
                        </SelectItem>
                        <SelectItem value="ASSURANCE">Assurance</SelectItem>
                        <SelectItem value="VISA_APPLICATION">
                          Demande de visa
                        </SelectItem>
                        <SelectItem value="CONSULTATION">
                          Consultation
                        </SelectItem>
                        <SelectItem value="OTHER">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`services.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalAmount();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`services.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix unitaire (MAD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value);
                              handlePriceChange(index, value);
                            }}
                            disabled={priceLoadingStates[index]}
                            className={
                              prefilledPrices[index]
                                ? "border-blue-300 bg-blue-50"
                                : ""
                            }
                          />
                          {priceLoadingStates[index] && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {prefilledPrices[index] && (
                        <p className="text-xs text-blue-600 mt-1">
                          ✓ Prérempli depuis l&apos;historique
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("services").length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear timer if exists
                    if (debounceTimers[index]) {
                      clearTimeout(debounceTimers[index]);
                    }

                    // Clean up states
                    setDebounceTimers((prev) => {
                      const newTimers = { ...prev };
                      delete newTimers[index];
                      return newTimers;
                    });
                    setPrefilledPrices((prev) => {
                      const newStates = { ...prev };
                      delete newStates[index];
                      return newStates;
                    });
                    setUserModifiedPrices((prev) => {
                      const newStates = { ...prev };
                      delete newStates[index];
                      return newStates;
                    });
                    setPriceLoadingStates((prev) => {
                      const newStates = { ...prev };
                      delete newStates[index];
                      return newStates;
                    });

                    const services = form.getValues("services");
                    form.setValue(
                      "services",
                      services.filter((_, i) => i !== index)
                    );
                    calculateTotalAmount();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer ce service
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const services = form.getValues("services");
          const newIndex = services.length;
          form.setValue("services", [
            ...services,
            { serviceType: "VISA_APPLICATION", quantity: 1, unitPrice: 0 },
          ]);

          // Reset states for new row
          setPrefilledPrices((prev) => ({ ...prev, [newIndex]: false }));
          setUserModifiedPrices((prev) => ({ ...prev, [newIndex]: false }));
          setPriceLoadingStates((prev) => ({ ...prev, [newIndex]: false }));
        }}
      >
        <Plus className="h-4 w-4 mr-2" /> Ajouter un service
      </Button>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="text-lg font-semibold">
            Total: {formatCurrency(form.watch("paymentConfig.totalAmount"))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="paymentConfig.paymentOption"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Option de paiement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CASH">Espèces</SelectItem>
                <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                <SelectItem value="CHEQUE">Chèque</SelectItem>
                <SelectItem value="POST">Mandat postal</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchPaymentOption === "BANK_TRANSFER" && (
        <FormField
          control={form.control}
          name="paymentConfig.transferCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code de transfert</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="paymentConfig.paymentModality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modalité de paiement</FormLabel>
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value);
                handlePaymentModalityChange(value);
              }}
              defaultValue={field.value}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FULL_PAYMENT" id="full" />
                <label htmlFor="full">Paiement complet</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SIXTY_FORTY" id="sixty-forty" />
                <label htmlFor="sixty-forty">60% / 40%</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MILESTONE_PAYMENTS" id="milestones" />
                <label htmlFor="milestones">Paiements par étapes</label>
              </div>
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>Échéances de paiement</FormLabel>
        {form.watch("paymentConfig.installments").map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`paymentConfig.installments.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`paymentConfig.installments.${index}.percentage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pourcentage (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const percentage = Number(e.target.value);
                              field.onChange(percentage);
                              const totalAmount = form.getValues(
                                "paymentConfig.totalAmount"
                              );
                              form.setValue(
                                `paymentConfig.installments.${index}.amount`,
                                (totalAmount * percentage) / 100
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`paymentConfig.installments.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (MAD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`paymentConfig.installments.${index}.dueDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d&apos;échéance</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchPaymentModality === "MILESTONE_PAYMENTS" &&
                  form.watch("paymentConfig.installments").length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const installments = form.getValues(
                          "paymentConfig.installments"
                        );
                        form.setValue(
                          "paymentConfig.installments",
                          installments.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer cette
                      échéance
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}

        {watchPaymentModality === "MILESTONE_PAYMENTS" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const installments = form.getValues("paymentConfig.installments");
              form.setValue("paymentConfig.installments", [
                ...installments,
                {
                  description: "",
                  percentage: 0,
                  amount: 0,
                  dueDate: new Date().toISOString().split("T")[0],
                },
              ]);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Ajouter une échéance
          </Button>
        )}
      </div>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="text-lg font-semibold">
              Montant total:{" "}
              {formatCurrency(form.watch("paymentConfig.totalAmount"))}
            </div>
            <div className="text-sm text-muted-foreground">
              Total des pourcentages:{" "}
              {form
                .watch("paymentConfig.installments")
                .reduce((sum, inst) => sum + inst.percentage, 0)}
              %
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Création d&apos;un client Phone Call</CardTitle>
            <CardDescription>
              Étape {currentStep} sur 3 -{" "}
              {currentStep === 1
                ? "Informations client"
                : currentStep === 2
                ? "Services"
                : "Configuration de paiement"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Précédent
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.push("/clients"))}
            >
              Annuler
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  // Basic validation before moving to next step
                  if (currentStep === 1) {
                    const values = form.getValues();
                    const basicFieldsComplete =
                      values.fullName &&
                      values.email &&
                      values.address &&
                      values.destination &&
                      values.visaType &&
                      values.phoneNumbers.length > 0;
                    const guardianFieldsComplete =
                      !values.isMinor ||
                      (values.guardianFullName &&
                        values.guardianCIN &&
                        values.guardianRelationship);

                    if (!basicFieldsComplete) {
                      toast.error("Veuillez remplir tous les champs requis");
                      return;
                    }
                    if (!guardianFieldsComplete) {
                      toast.error(
                        "Les informations du tuteur sont requises pour les mineurs"
                      );
                      return;
                    }
                  }
                  if (currentStep === 2) {
                    const hasErrors = form.getValues("services").length === 0;
                    if (hasErrors) {
                      toast.error("Veuillez ajouter au moins un service");
                      return;
                    }
                  }
                  setCurrentStep(currentStep + 1);
                }}
              >
                Suivant
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Créer le client
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
