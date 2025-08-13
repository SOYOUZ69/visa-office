import { Injectable } from '@nestjs/common';
import { ClientStatus, AttachmentType, ServiceType } from '@prisma/client';

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

  getServiceTypes(): string[] {
    return ['Translation', 'Dossier Treatment', 'Assurance', 'Visa Application', 'Consultation', 'Other'];
  }
}
