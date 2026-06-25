import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        organizationId: string;
        key: string;
        isArchived: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        key: string;
        description: string | null;
        isArchived: boolean;
        createdAt: Date;
        updatedAt: Date;
        totalTasks: number;
        completedTasks: number;
        progress: number;
        status: string;
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            tasks: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        organizationId: string;
        key: string;
        isArchived: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        organizationId: string;
        key: string;
        isArchived: boolean;
    }>;
}
