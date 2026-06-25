import { Controller, Post, Get, Param, Body, UseGuards, Delete, UseInterceptors, Patch } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from '../../core/tenant/workspace.guard';
import { TenantContextInterceptor } from '../../core/tenant/tenant-context.interceptor';
import { RequireWorkspace } from '../../core/tenant/require-workspace.decorator';
import { RolesGuard } from '../../core/roles/roles.guard';
import { Roles } from '../../core/roles/roles.decorator';

@RequireWorkspace()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}