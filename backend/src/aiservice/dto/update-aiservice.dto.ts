import { PartialType } from '@nestjs/mapped-types';
import { CreateAiserviceDto } from './create-aiservice.dto';

export class UpdateAiserviceDto extends PartialType(CreateAiserviceDto) {
  id: number;
}
