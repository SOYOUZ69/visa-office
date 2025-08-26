import { z } from "zod";

export const createClientSchema = z
  .object({
    clientType: z.enum(["INDIVIDUAL", "FAMILY", "GROUP", "PHONE_CALL"]),
    fullName: z.string().min(1, "Full name is required"),
    address: z.string().min(1, "Address is required"),
    jobTitle: z.string().optional(),
    passportNumber: z.string().optional(),
    email: z.string().email("Invalid email address"),
    destination: z.string().min(1, "Destination is required"),
    visaType: z.string().min(1, "Visa type is required"),
    notes: z.string().optional(),
    isMinor: z.boolean().optional().default(false),
    guardianFullName: z.string().optional(),
    guardianCIN: z.string().optional(),
    guardianRelationship: z.string().optional(),
    phoneNumbers: z
      .array(
        z.object({
          number: z.string().min(1, "Phone number is required"),
        })
      )
      .default([]),
    employers: z
      .array(
        z.object({
          name: z.string().min(1, "Employer name is required"),
          position: z.string().optional(),
        })
      )
      .default([]),
    familyMembers: z
      .array(
        z.object({
          fullName: z.string().min(1, "Full name is required"),
          passportNumber: z.string().min(1, "Passport number is required"),
          relationship: z.string().optional(),
          age: z.number().min(0).optional(),
        })
      )
      .default([])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.clientType !== "PHONE_CALL" && !data.passportNumber) {
        return false;
      }
      return true;
    },
    {
      message: "Passport number is required for non-phone call clients",
      path: ["passportNumber"],
    }
  )
  .refine(
    (data) => {
      if (
        data.clientType === "INDIVIDUAL" &&
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
      message: "Guardian information is required for minor individual clients",
      path: ["guardianFullName"],
    }
  )
  .refine(
    (data) => {
      if (
        (data.clientType === "FAMILY" || data.clientType === "GROUP") &&
        data.familyMembers?.length === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "At least one family member is required for FAMILY and GROUP client types",
      path: ["familyMembers"],
    }
  );

export type CreateClientInput = z.infer<typeof createClientSchema>;
