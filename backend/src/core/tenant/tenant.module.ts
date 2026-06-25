import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WorkspaceGuard } from './workspace.guard';
import { RolesGuard } from '../roles/roles.guard';
import { TenantContextInterceptor } from './tenant-context.interceptor';

@Module({
  imports: [PrismaModule],
  providers: [WorkspaceGuard, RolesGuard, TenantContextInterceptor],
  exports: [WorkspaceGuard, RolesGuard, TenantContextInterceptor],
})
export class TenantModule {}