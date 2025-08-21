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
        familyMembers: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            passportNumber: string;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.AttachmentType;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            path: string;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        passportNumber: string | null;
        clientType: import("@prisma/client").$Enums.ClientType;
        address: string;
        jobTitle: string | null;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        status: import("@prisma/client").$Enums.ClientStatus;
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
            familyMembers: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                fullName: string;
                passportNumber: string;
                relationship: string | null;
                age: number | null;
                clientId: string;
            }[];
            attachments: {
                id: string;
                createdAt: Date;
                type: import("@prisma/client").$Enums.AttachmentType;
                clientId: string;
                filename: string;
                originalName: string;
                mimetype: string;
                size: number;
                path: string;
            }[];
        } & {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            passportNumber: string | null;
            clientType: import("@prisma/client").$Enums.ClientType;
            address: string;
            jobTitle: string | null;
            destination: string;
            visaType: string;
            notes: string | null;
            isMinor: boolean;
            guardianFullName: string | null;
            guardianCIN: string | null;
            guardianRelationship: string | null;
            status: import("@prisma/client").$Enums.ClientStatus;
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
        familyMembers: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            passportNumber: string;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.AttachmentType;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            path: string;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        passportNumber: string | null;
        clientType: import("@prisma/client").$Enums.ClientType;
        address: string;
        jobTitle: string | null;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        status: import("@prisma/client").$Enums.ClientStatus;
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
        familyMembers: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            passportNumber: string;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.AttachmentType;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            path: string;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        passportNumber: string | null;
        clientType: import("@prisma/client").$Enums.ClientType;
        address: string;
        jobTitle: string | null;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        status: import("@prisma/client").$Enums.ClientStatus;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addFamilyMember(clientId: string, createFamilyMemberDto: CreateFamilyMemberDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        passportNumber: string;
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
        familyMembers: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            passportNumber: string;
            relationship: string | null;
            age: number | null;
            clientId: string;
        }[];
        attachments: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.AttachmentType;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            path: string;
        }[];
        serviceItems: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            clientId: string;
        }[];
        payments: ({
            installments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                status: import("@prisma/client").$Enums.InstallmentStatus;
                percentage: import("@prisma/client/runtime/library").Decimal;
                amount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date;
                paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
                transferCode: string | null;
                paymentId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
            paymentModality: import("@prisma/client").$Enums.PaymentModality;
            transferCode: string | null;
            clientId: string;
            caisseId: string | null;
        })[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        passportNumber: string | null;
        clientType: import("@prisma/client").$Enums.ClientType;
        address: string;
        jobTitle: string | null;
        destination: string;
        visaType: string;
        notes: string | null;
        isMinor: boolean;
        guardianFullName: string | null;
        guardianCIN: string | null;
        guardianRelationship: string | null;
        status: import("@prisma/client").$Enums.ClientStatus;
    }) | null>;
}
