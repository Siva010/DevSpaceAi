import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../core/tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}