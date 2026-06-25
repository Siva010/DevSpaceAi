import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
declare class UpdateOrgNameDto {
    name: string;
}
export declare class OrganizationsController {
    private readonly orgService;
    constructor(orgService: OrganizationsService);
    create(req: any, createOrganizationDto: CreateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    findAll(req: any): Promise<{
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
    updateName(slug: string, body: UpdateOrgNameDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    addMember(slug: string, body: {
        email: string;
        role?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        userId: string;
        roleId: string;
    }>;
}
export {};
