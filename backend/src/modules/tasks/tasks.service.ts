import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(creatorId: string, createTaskDto: CreateTaskDto) {
    const { title, description, projectId, status, priority, order, assigneeId, dueDate } = createTaskDto;

    // The Prisma extension automatically checks within the current organization
    const project = await this.prisma.extended.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this workspace');
    }

    // Default order if not provided
    let newOrder = order;
    if (newOrder === undefined) {
      const maxOrderTask = await this.prisma.extended.task.findFirst({
        where: { projectId, status: status || 'TODO' },
        orderBy: { order: 'desc' },
      });
      newOrder = maxOrderTask ? maxOrderTask.order + 1000 : 1000;
    }

    return this.prisma.extended.task.create({
      data: {
        title,
        description,
        projectId,
        status: status || 'TODO',
        priority: priority || 4,
        order: newOrder,
        assigneeId,
        creatorId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      } as any,
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findAllForProject(projectId?: string) {
    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }

    return this.prisma.extended.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { order: 'asc' }, // Changed to order by order field
    });
  }

  async updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto) {
    const task = await this.prisma.extended.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { status, order } = updateTaskStatusDto;

    return this.prisma.extended.task.update({
      where: { id },
      data: { 
        status,
        ...(order !== undefined ? { order } : {})
      },
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.extended.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { dueDate, ...rest } = updateTaskDto;

    return this.prisma.extended.task.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    const task = await this.prisma.extended.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.extended.task.delete({ where: { id } });
  }
}
