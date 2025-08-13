import type { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    uploadFile(clientId: string, file: Express.Multer.File, uploadAttachmentDto: UploadAttachmentDto): Promise<{
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
    downloadFile(id: string, res: Response): Promise<void>;
}
