import { ClientFormProps } from "@/types";
import { Client } from "@/types"; // assuming you have a Client type
import { createClientSchema } from "../schema/createClient.schema";
import z from "zod";

type ClientFormData = z.infer<typeof createClientSchema>;

export function getClientFormDefaults(
  client?: Client,
  clientType?: "INDIVIDUAL" | "FAMILY" | "GROUP" | "PHONE_CALL"
): ClientFormData {
  return {
    clientType: clientType || "INDIVIDUAL",
    fullName: client?.fullName || "",
    address: client?.address || "",
    jobTitle: client?.jobTitle || "",
    passportNumber: client?.passportNumber || "",
    email: client?.email || "",
    destination: client?.destination || "",
    visaType: client?.visaType || "",
    notes: client?.notes || "",
    isMinor: client?.isMinor || false,
    guardianFullName: client?.guardianFullName || "",
    guardianCIN: client?.guardianCIN || "",
    guardianRelationship: client?.guardianRelationship || "",
    phoneNumbers: client?.phoneNumbers.map((p) => ({ number: p.number })) || [],
    employers:
      client?.employers.map((e) => ({
        name: e.name,
        position: e.position,
      })) || [],
    familyMembers:
      client?.familyMembers.map((f) => ({
        fullName: f.fullName,
        passportNumber: f.passportNumber,
        relationship: f.relationship,
        age: f.age,
      })) || [],
  };
}
