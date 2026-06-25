import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from '../../core/tenant/workspace.guard';
import { TenantContextInterceptor } from '../../core/tenant/tenant-context.interceptor';
import { RequireWorkspace } from '../../core/tenant/require-workspace.decorator';
import { RolesGuard } from '../../core/roles/roles.guard';
import { Roles } from '../../core/roles/roles.decorator';

@RequireWorkspace()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}