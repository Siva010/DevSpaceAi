export declare class CreateTaskDto {
    title: string;
    description?: string;
    projectId: string;
    status?: string;
    priority?: number;
    assigneeId?: string;
    dueDate?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    priority?: number;
    assigneeId?: string;
    dueDate?: string;
}
export declare class UpdateTaskStatusDto {
    status: string;
}
