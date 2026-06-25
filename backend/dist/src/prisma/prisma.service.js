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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const tenant_context_1 = require("../core/tenant/tenant.context");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    extended;
    constructor() {
        const connectionString = process.env.DATABASE_URL || 'postgresql://devspace:devspace_password@127.0.0.1:5433/devspace_db?schema=public';
        const pool = new pg_1.Pool({ connectionString });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super({ adapter });
        this.extended = this.getExtendedClient();
    }
    async onModuleInit() {
        await this.$connect();
    }
    getExtendedClient() {
        return this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const store = tenant_context_1.tenantContext.getStore();
                        const organizationId = store?.organizationId;
                        const tenantModels = ['Project', 'Task', 'Document', 'TaskComment', 'Membership'];
                        if (organizationId && tenantModels.includes(model)) {
                            const noWhereOperations = ['create', 'createMany'];
                            if (!noWhereOperations.includes(operation)) {
                                args.where = { ...args.where, organizationId };
                            }
                            if (['create', 'createMany', 'update', 'updateMany', 'upsert'].includes(operation)) {
                                if (args.data) {
                                    if (Array.isArray(args.data)) {
                                        args.data = args.data.map((d) => ({ ...d, organizationId }));
                                    }
                                    else {
                                        args.data = { ...args.data, organizationId };
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
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map