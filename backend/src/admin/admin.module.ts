import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [RolesModule],
  controllers: [AdminController],
})
export class AdminModule {}