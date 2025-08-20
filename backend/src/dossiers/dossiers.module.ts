import { Module } from '@nestjs/common';
import { DossiersService } from './dossiers.service';
import { DossiersController } from './dossiers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DossiersController],
  providers: [DossiersService],
  exports: [DossiersService],
})
export class DossiersModule {}