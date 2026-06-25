import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRE_WORKSPACE_KEY } from './require-workspace.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireWorkspace = this.reflector.getAllAndOverride<boolean>(REQUIRE_WORKSPACE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireWorkspace) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException();
    }

    const slug =
      (request.headers['x-workspace-slug'] as string | undefined) || request.params?.slug;

    if (!slug) {
      throw new BadRequestException('Workspace slug is required');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });

    if (!organization) {
      throw new NotFoundException(`Workspace '${slug}' not found`);
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      include: { role: true },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    request.workspace = {
      organizationId: organization.id,
      slug: organization.slug,
      role: membership.role.name,
      membershipId: membership.id,
    };

    return true;
  }
}