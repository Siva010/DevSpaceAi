"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(creatorId, createTaskDto) {
        const { title, description, projectId, status, priority, assigneeId, dueDate } = createTaskDto;
        const project = await this.prisma.extended.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found in this workspace');
        }
        return this.prisma.extended.task.create({
            data: {
                title,
                description,
                projectId,
                status: status || 'TODO',
                priority: priority || 4,
                assigneeId,
                creatorId,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            },
            include: {
                assignee: { select: { id: true, fullName: true, email: true } },
                creator: { select: { id: true, fullName: true, email: true } },
            },
        });
    }
    async findAllForProject(projectId) {
        const where = {};
        if (projectId) {
            where.projectId = projectId;
        }
        return this.prisma.extended.task.findMany({
            where,
            include: {
                assignee: { select: { id: true, fullName: true, email: true } },
                creator: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, updateTaskStatusDto) {
        const task = await this.prisma.extended.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.extended.task.update({
            where: { id },
            data: { status: updateTaskStatusDto.status },
            include: {
                assignee: { select: { id: true, fullName: true, email: true } },
                creator: { select: { id: true, fullName: true, email: true } },
            },
        });
    }
    async update(id, updateTaskDto) {
        const task = await this.prisma.extended.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
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
    async delete(id) {
        const task = await this.prisma.extended.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.extended.task.delete({ where: { id } });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map