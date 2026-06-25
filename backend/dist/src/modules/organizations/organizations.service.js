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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let OrganizationsService = class OrganizationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createOrganizationDto) {
        const { name, slug } = createOrganizationDto;
        const existing = await this.prisma.organization.findUnique({ where: { slug } });
        if (existing) {
            throw new common_1.ConflictException('Workspace slug is already taken');
        }
        const org = await this.prisma.organization.create({
            data: { name, slug },
        });
        let ownerRole = await this.prisma.role.findUnique({ where: { name: 'OWNER' } });
        if (!ownerRole) {
            ownerRole = await this.prisma.role.create({ data: { name: 'OWNER', description: 'Workspace Owner' } });
        }
        await this.prisma.membership.create({
            data: {
                organizationId: org.id,
                userId,
                roleId: ownerRole.id,
            },
        });
        return org;
    }
    async findAllForUser(userId) {
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
    async getMembers(slug) {
        const org = await this.prisma.organization.findUnique({ where: { slug } });
        if (!org)
            return [];
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
    async updateName(slug, name) {
        return this.prisma.organization.update({
            where: { slug },
            data: { name },
        });
    }
    async addMember(slug, email, roleName = 'MEMBER') {
        const org = await this.prisma.organization.findUnique({ where: { slug } });
        if (!org)
            throw new common_1.NotFoundException('Workspace not found');
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('User with that email not found. They must register first.');
        let role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) {
            role = await this.prisma.role.create({ data: { name: roleName, description: `Workspace ${roleName}` } });
        }
        const existing = await this.prisma.membership.findFirst({
            where: { organizationId: org.id, userId: user.id }
        });
        if (existing)
            throw new common_1.ConflictException('User is already a member');
        return this.prisma.membership.create({
            data: {
                organizationId: org.id,
                userId: user.id,
                roleId: role.id,
            }
        });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map