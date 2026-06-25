"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const connectionString = process.env.DATABASE_URL || 'postgresql://devspace:devspace_password@127.0.0.1:5433/devspace_db?schema=public';
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    const passwordHash = await bcrypt.hash('password', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@devspace.ai' },
        update: {},
        create: {
            email: 'admin@devspace.ai',
            fullName: 'Admin User',
            passwordHash,
        },
    });
    console.log('Created user:', user.email);
    const role = await prisma.role.upsert({
        where: { name: 'OWNER' },
        update: {},
        create: {
            name: 'OWNER',
            description: 'Workspace Owner',
        },
    });
    const org = await prisma.organization.upsert({
        where: { slug: 'acme' },
        update: {},
        create: {
            name: 'Acme Corp',
            slug: 'acme',
        },
    });
    console.log('Created organization:', org.name);
    await prisma.membership.upsert({
        where: {
            organizationId_userId: {
                organizationId: org.id,
                userId: user.id,
            },
        },
        update: {},
        create: {
            organizationId: org.id,
            userId: user.id,
            roleId: role.id,
        },
    });
    await prisma.project.upsert({
        where: {
            organizationId_key: {
                organizationId: org.id,
                key: 'WEB',
            },
        },
        update: {},
        create: {
            organizationId: org.id,
            name: 'Website Redesign',
            key: 'WEB',
            description: 'Complete overhaul of the marketing site',
        },
    });
    await prisma.project.upsert({
        where: {
            organizationId_key: {
                organizationId: org.id,
                key: 'MOB',
            },
        },
        update: {},
        create: {
            organizationId: org.id,
            name: 'Mobile App V2',
            key: 'MOB',
            description: 'Next gen mobile app',
        },
    });
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map