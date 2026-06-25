import { ForbiddenException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { tenantContext } from '../core/tenant/tenant.context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  // Create an extended client property to be used by our services
  public readonly extended: ReturnType<typeof this.getExtendedClient>;

  constructor() {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    super({ adapter } as any);
    this.extended = this.getExtendedClient();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private getExtendedClient() {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const store = tenantContext.getStore();
            const organizationId = store?.organizationId;

            // Define which models should be strictly isolated by tenant
            // TaskComment is intentionally excluded - it doesn't have organizationId.
            // Tenant isolation for comments is achieved through the parent Task's organizationId.
            const tenantModels = ['Project', 'Task', 'Document', 'Membership'];

            if (tenantModels.includes(model)) {
              if (!organizationId) {
                throw new ForbiddenException(
                  'Workspace context is required for this operation',
                );
              }
              // Automatically inject the organizationId into the WHERE clause
              // to prevent cross-tenant data leaks (except for create operations which don't have a where clause)
              const noWhereOperations = ['create', 'createMany'];
              if (!noWhereOperations.includes(operation)) {
                (args as any).where = { ...(args as any).where, organizationId };
              }
              
              // For create/update operations, ensure organizationId is also enforced in the data payload
              if (['create', 'createMany', 'update', 'updateMany', 'upsert'].includes(operation)) {
                if ((args as any).data) {
                    if (Array.isArray((args as any).data)) {
                        (args as any).data = (args as any).data.map((d: any) => ({ ...d, organizationId }));
                    } else {
                        (args as any).data = { ...(args as any).data, organizationId };
                    }
                }
              }
            }

            return query(args);
          },
        },
      },
    });
  }
}
