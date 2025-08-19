import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { CreatePhoneCallClientDto } from './dto/create-phone-call-client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createClientDto: CreateClientDto): Promise<{
        phoneNumbers: {
            number: string;
            id: string;
            clientId: string;
        }[];
        employers: {
            id: string;
            name: string;
            position: string | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            type: import("@prisma/client").$Enums.AttachmentType;
            path: string;
        }[];
        familyMembers: {
            id: string;
            fullName: string;
            passportNumber: string;
            createdAt: Date;
            updatedAt: Date;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
    } & {
        id: string;
        clientType: import("@prisma/client").$Enums.ClientType;
        status: import("@prisma/client").$Enums.ClientStatus;
        fullName: string;
        address: string;
        jobTitle: string | null;
        passportNumber: string | null;
        email: string;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryClientDto): Promise<{
        data: ({
            phoneNumbers: {
                number: string;
                id: string;
                clientId: string;
            }[];
            employers: {
                id: string;
                name: string;
                position: string | null;
                clientId: string;
            }[];
            attachments: {
                id: string;
                createdAt: Date;
                clientId: string;
                filename: string;
                originalName: string;
                mimetype: string;
                size: number;
                type: import("@prisma/client").$Enums.AttachmentType;
                path: string;
            }[];
            familyMembers: {
                id: string;
                fullName: string;
                passportNumber: string;
                createdAt: Date;
                updatedAt: Date;
                relationship: string | null;
                age: number | null;
                clientId: string;
            }[];
        } & {
            id: string;
            clientType: import("@prisma/client").$Enums.ClientType;
            status: import("@prisma/client").$Enums.ClientStatus;
            fullName: string;
            address: string;
            jobTitle: string | null;
            passportNumber: string | null;
            email: string;
            destination: string;
            visaType: string;
            notes: string | null;
            isMinor: boolean;
            guardianFullName: string | null;
            guardianCIN: string | null;
            guardianRelationship: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        phoneNumbers: {
            number: string;
            id: string;
            clientId: string;
        }[];
        employers: {
            id: string;
            name: string;
            position: string | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            type: import("@prisma/client").$Enums.AttachmentType;
            path: string;
        }[];
        familyMembers: {
            id: string;
            fullName: string;
            passportNumber: string;
            createdAt: Date;
            updatedAt: Date;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
    } & {
        id: string;
        clientType: import("@prisma/client").$Enums.ClientType;
        status: import("@prisma/client").$Enums.ClientStatus;
        fullName: string;
        address: string;
        jobTitle: string | null;
        passportNumber: string | null;
        email: string;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<{
        phoneNumbers: {
            number: string;
            id: string;
            clientId: string;
        }[];
        employers: {
            id: string;
            name: string;
            position: string | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            type: import("@prisma/client").$Enums.AttachmentType;
            path: string;
        }[];
        familyMembers: {
            id: string;
            fullName: string;
            passportNumber: string;
            createdAt: Date;
            updatedAt: Date;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
    } & {
        id: string;
        clientType: import("@prisma/client").$Enums.ClientType;
        status: import("@prisma/client").$Enums.ClientStatus;
        fullName: string;
        address: string;
        jobTitle: string | null;
        passportNumber: string | null;
        email: string;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addFamilyMember(clientId: string, createFamilyMemberDto: CreateFamilyMemberDto): Promise<{
        id: string;
        fullName: string;
        passportNumber: string;
        createdAt: Date;
        updatedAt: Date;
        relationship: string | null;
        age: number | null;
        clientId: string;
    }>;
    removeFamilyMember(id: string): Promise<{
        message: string;
    }>;
    createPhoneCallClient(dto: CreatePhoneCallClientDto): Promise<({
        phoneNumbers: {
            number: string;
            id: string;
            clientId: string;
        }[];
        employers: {
            id: string;
            name: string;
            position: string | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            type: import("@prisma/client").$Enums.AttachmentType;
            path: string;
        }[];
        familyMembers: {
            id: string;
            fullName: string;
            passportNumber: string;
            createdAt: Date;
            updatedAt: Date;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
        serviceItems: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        payments: ({
            installments: {
                id: string;
                status: import("@prisma/client").$Enums.InstallmentStatus;
                createdAt: Date;
                updatedAt: Date;
                paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
                transferCode: string | null;
                paymentId: string;
                description: string;
                percentage: import("@prisma/client/runtime/library").Decimal;
                amount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
            paymentModality: import("@prisma/client").$Enums.PaymentModality;
            transferCode: string | null;
        })[];
    } & {
        id: string;
        clientType: import("@prisma/client").$Enums.ClientType;
        status: import("@prisma/client").$Enums.ClientStatus;
        fullName: string;
        address: string;
        jobTitle: string | null;
        passportNumber: string | null;
        email: string;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
}
