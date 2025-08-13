import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttachmentType } from '@prisma/client';

export class UploadAttachmentDto {
  @ApiProperty({ enum: AttachmentType, example: AttachmentType.PASSPORT })
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: Express.Multer.File;
}
