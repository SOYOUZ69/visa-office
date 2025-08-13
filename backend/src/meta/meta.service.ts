import { Injectable } from '@nestjs/common';
import { ClientStatus, AttachmentType } from '@prisma/client';

@Injectable()
export class MetaService {
  getClientStatuses(): string[] {
    return Object.values(ClientStatus);
  }

  getVisaTypes(): string[] {
    return [
      'Tourist',
      'Spouse',
      'Family Reunion',
      'Study',
      'Professional Internship',
      'Student Internship',
      'Work',
      'Medical',
      'Other'
    ];
  }

  getAttachmentTypes(): string[] {
    return Object.values(AttachmentType);
  }
}
