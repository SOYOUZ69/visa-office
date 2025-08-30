import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { AiServiceController } from './aiservice.controller';
import { AiService } from './aiservice.service';

@Module({
  imports: [HttpModule],
  controllers: [AiServiceController],
  providers: [AiService],
  exports: [AiService],
})
export class AiServiceModule {}
