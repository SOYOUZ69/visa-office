import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
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
            type: import("@prisma/client").$Enums.AttachmentType;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            path: string;
        }[];
        familyMembers: {
            id: string;
            fullName: string;
            relationship: string;
            age: number | null;
            clientId: string;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        clientType: import("@prisma/client").$Enums.ClientType;
        fullName: string;
        address: string;
        jobTitle: string | null;
        passportNumber: string | null;
        destination: string;
        visaType: string;
        notes: string | null;
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
            familyMembers: {
                id: string;
                fullName: string;
                relationship: string;
                age: number | null;
                clientId: string;
            }[];
        } & {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            clientType: import("@prisma/client").$Enums.ClientType;
            fullName: string;
            address: string;
            jobTitle: string | null;
            passportNumber: string | null;
            destination: string;
            visaType: string;
            notes: string | null;
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
        familyMembers: {
            id: string;
            fullName: string;
            relationship: string;
            age: number | null;
            clientId: string;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        clientType: import("@prisma/client").$Enums.ClientType;
        fullName: string;
        address: string;
        jobTitle: string | null;
        passportNumber: string | null;
        destination: string;
        visaType: string;
        notes: string | null;
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
        familyMembers: {
            id: string;
            fullName: string;
            relationship: string;
            age: number | null;
            clientId: string;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        clientType: import("@prisma/client").$Enums.ClientType;
        fullName: string;
        address: string;
        jobTitle: string | null;
        passportNumber: string | null;
        destination: string;
        visaType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.ClientStatus;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addFamilyMember(clientId: string, createFamilyMemberDto: CreateFamilyMemberDto): Promise<{
        id: string;
        fullName: string;
        relationship: string;
        age: number | null;
        clientId: string;
    }>;
    removeFamilyMember(id: string): Promise<{
        message: string;
    }>;
}
