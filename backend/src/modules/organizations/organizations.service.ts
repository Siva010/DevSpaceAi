import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createOrganizationDto: CreateOrganizationDto) {
    const { name, slug } = createOrganizationDto;

    // Check if slug exists
    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Workspace slug is already taken');
    }

    // Create the organization
    const org = await this.prisma.organization.create({
      data: { name, slug },
    });

    // Automatically make the creator the OWNER
    // Usually we would query the Role table for the "OWNER" role ID, but for simplicity we will assume it exists
    // Let's create the role inline if it doesn't exist for the sake of robust bootstrapping
    const ownerRole = await this.prisma.role.upsert({
      where: { name: 'OWNER' },
      update: {},
      create: { name: 'OWNER', description: 'Workspace Owner' },
    });

    await this.prisma.membership.create({
      data: {
        organizationId: org.id,
        userId,
        roleId: ownerRole.id,
      },
    });

    return org;
  }

  async findAllForUser(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: { select: { memberships: true } },
          },
        },
        role: true,
      },
    });

    return memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      createdAt: m.organization.createdAt,
      role: m.role.name,
      membersCount: m.organization._count.memberships,
    }));
  }

  async getMembers(slug: string) {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException('Workspace not found');

    const memberships = await this.prisma.membership.findMany({
      where: { organizationId: org.id },
      include: {
        user: { select: { id: true, fullName: true, email: true, createdAt: true } },
        role: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      id: m.user.id,
      name: m.user.fullName || m.user.email,
      email: m.user.email,
      role: m.role.name,
      joinedDate: m.createdAt,
    }));
  }

  async updateName(slug: string, name: string) {
    return this.prisma.organization.update({
      where: { slug },
      data: { name },
    });
  }

  async addMember(slug: string, email: string, roleName: string = 'MEMBER') {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException('Workspace not found');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User with that email not found. They must register first.');

    const role = await this.prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `Workspace ${roleName}` },
    });

    const existing = await this.prisma.membership.findFirst({
      where: { organizationId: org.id, userId: user.id }
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.prisma.membership.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        roleId: role.id,
      }
    });
  }

  async removeMember(slug: string, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException('Workspace not found');

    const membership = await this.prisma.membership.findFirst({
      where: { organizationId: org.id, userId },
      include: { role: true },
    });

    if (!membership) throw new NotFoundException('Member not found');

    if (membership.role.name === 'OWNER') {
      const otherOwners = await this.prisma.membership.count({
        where: { organizationId: org.id, role: { name: 'OWNER' }, userId: { not: userId } }
      });
      if (otherOwners === 0) {
        throw new ConflictException('Cannot remove the last owner. Delete the workspace instead.');
      }
    }

    return this.prisma.membership.delete({
      where: { id: membership.id },
    });
  }

  async delete(slug: string) {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException('Workspace not found');

    return this.prisma.organization.delete({
      where: { id: org.id },
    });
  }
}

