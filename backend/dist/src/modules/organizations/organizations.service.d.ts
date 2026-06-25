import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
export declare class OrganizationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createOrganizationDto: CreateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    findAllForUser(userId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        role: string;
        membersCount: number;
    }[]>;
    getMembers(slug: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: string;
        joinedDate: Date;
    }[]>;
    updateName(slug: string, name: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    addMember(slug: string, email: string, roleName?: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        userId: string;
        roleId: string;
    }>;
}
