import { AttachmentType } from '@prisma/client';
export declare class UploadAttachmentDto {
    type: AttachmentType;
    file?: Express.Multer.File;
}
