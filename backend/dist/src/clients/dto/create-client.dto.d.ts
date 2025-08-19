import { ClientType } from '@prisma/client';
import { CreateFamilyMemberDto } from './create-family-member.dto';
export declare class PhoneNumberDto {
    number: string;
}
export declare class EmployerDto {
    name: string;
    position?: string;
}
export declare class CreateClientDto {
    clientType: ClientType;
    fullName: string;
    address: string;
    jobTitle?: string;
    passportNumber?: string;
    email: string;
    destination: string;
    visaType: string;
    notes?: string;
    isMinor?: boolean;
    guardianFullName?: string;
    guardianCIN?: string;
    guardianRelationship?: string;
    phoneNumbers?: PhoneNumberDto[];
    employers?: EmployerDto[];
    familyMembers?: CreateFamilyMemberDto[];
}
