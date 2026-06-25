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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProjectDto) {
        const { name, key, description } = createProjectDto;
        const existing = await this.prisma.extended.project.findFirst({
            where: { key },
        });
        if (existing) {
            throw new common_1.ConflictException('Project key already exists in this workspace');
        }
        return this.prisma.extended.project.create({
            data: { name, key, description },
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
    async findOne(id) {
        const project = await this.prisma.extended.project.findUnique({
            where: { id },
            include: {
                _count: { select: { tasks: true } },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async remove(id) {
        return this.prisma.extended.project.delete({
            where: { id },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map