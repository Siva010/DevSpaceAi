import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from '../../core/tenant/workspace.guard';
import { RolesGuard } from '../../core/roles/roles.guard';
import { RequireWorkspace } from '../../core/tenant/require-workspace.decorator';
import { Roles } from '../../core/roles/roles.decorator';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn } from 'class-validator';

class UpdateOrgNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @IsIn(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'])
  role?: string;
}

@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Controller('api/organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  async create(@Request() req: any, @Body() createOrganizationDto: CreateOrganizationDto) {
    return this.orgService.create(req.user.id, createOrganizationDto);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.orgService.findAllForUser(req.user.id);
  }

  @RequireWorkspace()
  @Get(':slug/members')
  async getMembers(@Param('slug') slug: string) {
    return this.orgService.getMembers(slug);
  }

  @RequireWorkspace()
  @Roles('OWNER', 'ADMIN')
  @Patch(':slug')
  async updateName(@Param('slug') slug: string, @Body() body: UpdateOrgNameDto) {
    return this.orgService.updateName(slug, body.name);
  }

  @RequireWorkspace()
  @Roles('OWNER', 'ADMIN')
  @Post(':slug/members')
  async addMember(@Param('slug') slug: string, @Body() body: AddMemberDto) {
    return this.orgService.addMember(slug, body.email, body.role);
  }

  @RequireWorkspace()
  @Roles('OWNER', 'ADMIN')
  @Delete(':slug/members/:userId')
  async removeMember(@Param('slug') slug: string, @Param('userId') userId: string) {
    return this.orgService.removeMember(slug, userId);
  }

  @RequireWorkspace()
  @Roles('OWNER')
  @Delete(':slug')
  async delete(@Param('slug') slug: string) {
    return this.orgService.delete(slug);
  }
}