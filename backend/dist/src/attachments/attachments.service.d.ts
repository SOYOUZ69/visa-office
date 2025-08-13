import { PrismaService } from '../prisma/prisma.service';
import { AttachmentType } from '@prisma/client';
export declare class AttachmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    uploadFile(clientId: string, file: Express.Multer.File, type: AttachmentType): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.AttachmentType;
        clientId: string;
        filename: string;
        originalName: string;
        mimetype: string;
        size: number;
        path: string;
    }>;
    getClientAttachments(clientId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.AttachmentType;
        clientId: string;
        filename: string;
        originalName: string;
        mimetype: string;
        size: number;
        path: string;
    }[]>;
    deleteAttachment(id: string): Promise<{
        message: string;
    }>;
    getAttachmentFile(id: string): Promise<{
        attachment: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.AttachmentType;
            clientId: string;
            filename: string;
            originalName: string;
            mimetype: string;
            size: number;
            path: string;
        };
        fileBuffer: NonSharedBuffer;
    }>;
}
