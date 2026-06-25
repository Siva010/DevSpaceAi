import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Request, Query, UseInterceptors } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from '../../core/tenant/workspace.guard';
import { TenantContextInterceptor } from '../../core/tenant/tenant-context.interceptor';
import { RequireWorkspace } from '../../core/tenant/require-workspace.decorator';
import { RolesGuard } from '../../core/roles/roles.guard';
import { Roles } from '../../core/roles/roles.decorator';

@RequireWorkspace()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  async findAll(@Query('projectId') projectId?: string) {
    return this.tasksService.findAllForProject(projectId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() updateTaskStatusDto: UpdateTaskStatusDto) {
    return this.tasksService.updateStatus(id, updateTaskStatusDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}