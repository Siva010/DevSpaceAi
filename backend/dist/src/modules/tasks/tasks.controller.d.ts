import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(req: any, createTaskDto: CreateTaskDto): Promise<{
        assignee: {
            id: string;
            email: string;
            fullName: string | null;
        } | null;
        creator: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        organizationId: string;
        projectId: string;
        title: string;
        status: string;
        priority: number;
        assigneeId: string | null;
        creatorId: string;
        dueDate: Date | null;
    }>;
    findAll(projectId?: string): Promise<({
        assignee: {
            id: string;
            email: string;
            fullName: string | null;
        } | null;
        creator: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        organizationId: string;
        projectId: string;
        title: string;
        status: string;
        priority: number;
        assigneeId: string | null;
        creatorId: string;
        dueDate: Date | null;
    })[]>;
    updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto): Promise<{
        assignee: {
            id: string;
            email: string;
            fullName: string | null;
        } | null;
        creator: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        organizationId: string;
        projectId: string;
        title: string;
        status: string;
        priority: number;
        assigneeId: string | null;
        creatorId: string;
        dueDate: Date | null;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<{
        assignee: {
            id: string;
            email: string;
            fullName: string | null;
        } | null;
        creator: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        organizationId: string;
        projectId: string;
        title: string;
        status: string;
        priority: number;
        assigneeId: string | null;
        creatorId: string;
        dueDate: Date | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        organizationId: string;
        projectId: string;
        title: string;
        status: string;
        priority: number;
        assigneeId: string | null;
        creatorId: string;
        dueDate: Date | null;
    }>;
}
