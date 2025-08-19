import { ServiceType, PaymentOption, PaymentModality } from '@prisma/client';
declare class PhoneNumberDto {
    number: string;
}
declare class EmployerDto {
    name: string;
    position?: string;
}
declare class ServiceItemDto {
    serviceType: ServiceType;
    quantity: number;
    unitPrice: number;
}
declare class PaymentInstallmentDto {
    description: string;
    percentage: number;
    amount: number;
    dueDate: string;
}
declare class PaymentConfigDto {
    totalAmount: number;
    paymentOption: PaymentOption;
    paymentModality: PaymentModality;
    transferCode?: string;
    installments: PaymentInstallmentDto[];
}
export declare class CreatePhoneCallClientDto {
    clientType: 'PHONE_CALL';
    fullName: string;
    address: string;
    jobTitle?: string;
    email: string;
    destination: string;
    visaType: string;
    notes?: string;
    isMinor?: boolean;
    guardianFullName?: string;
    guardianCIN?: string;
    guardianRelationship?: string;
    phoneNumbers: PhoneNumberDto[];
    employers?: EmployerDto[];
    services: ServiceItemDto[];
    paymentConfig: PaymentConfigDto;
}
export {};
