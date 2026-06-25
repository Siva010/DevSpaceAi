import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const { name, key, description } = createProjectDto;

    // The Prisma extension automatically checks within the current organization
    const existing = await this.prisma.extended.project.findFirst({
      where: { key },
    });

    if (existing) {
      throw new ConflictException('Project key already exists in this workspace');
    }

    return this.prisma.extended.project.create({
      data: { name, key, description } as any,
    });
  }

  async findAll() {
    const projects = await this.prisma.extended.project.findMany({
      where: { isArchived: false },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => {
      const totalTasks = p._count.tasks;
      const completedTasks = p.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        key: p.key,
        description: p.description,
        isArchived: p.isArchived,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        totalTasks,
        completedTasks,
        progress,
        status: p.isArchived ? 'Archived' : 'Active',
      };
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.extended.project.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.extended.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    if (updateProjectDto.key) {
      const existing = await this.prisma.extended.project.findFirst({
        where: { key: updateProjectDto.key, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Project key already exists in this workspace');
      }
    }

    return this.prisma.extended.project.update({
      where: { id },
      data: updateProjectDto as any,
    });
  }

  async remove(id: string) {
    const project = await this.prisma.extended.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.prisma.extended.project.delete({
      where: { id },
    });
  }
}
