import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    readonly extended: ReturnType<typeof this.getExtendedClient>;
    constructor();
    onModuleInit(): Promise<void>;
    private getExtendedClient;
}
