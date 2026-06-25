import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(createDocumentDto: CreateDocumentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isArchived: boolean;
        title: string;
        content: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isArchived: boolean;
        title: string;
        content: string | null;
    }[]>;
    findOne(id: string): Promise<{
        versions: {
            id: string;
            createdAt: Date;
            content: string;
            documentId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isArchived: boolean;
        title: string;
        content: string | null;
    }>;
    update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isArchived: boolean;
        title: string;
        content: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isArchived: boolean;
        title: string;
        content: string | null;
    }>;
}
