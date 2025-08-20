import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MetaModule } from './meta/meta.module';
import { ClientsModule } from './clients/clients.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ServicesModule } from './services/services.module';
import { PaymentsModule } from './payments/payments.module';
import { DossiersModule } from './dossiers/dossiers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MetaModule,
    ClientsModule,
    AttachmentsModule,
    ServicesModule,
    PaymentsModule,
    DossiersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
