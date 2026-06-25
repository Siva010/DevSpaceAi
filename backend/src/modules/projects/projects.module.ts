import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TenantModule } from '../../core/tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}