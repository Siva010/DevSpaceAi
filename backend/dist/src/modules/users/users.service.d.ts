import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        email: string;
        fullName: string | null;
        createdAt: Date;
    }>;
}
