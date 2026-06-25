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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDocumentDto) {
        const { title, content } = createDocumentDto;
        return this.prisma.extended.document.create({
            data: { title, content },
        });
    }
    async findAll() {
        return this.prisma.extended.document.findMany({
            where: { isArchived: false },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const doc = await this.prisma.extended.document.findUnique({
            where: { id },
            include: { versions: { orderBy: { createdAt: 'desc' }, take: 10 } },
        });
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        return doc;
    }
    async update(id, updateDocumentDto) {
        const doc = await this.prisma.extended.document.findUnique({ where: { id } });
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (doc.content) {
            await this.prisma.extended.documentVersion.create({
                data: { documentId: id, content: doc.content },
            });
        }
        return this.prisma.extended.document.update({
            where: { id },
            data: updateDocumentDto,
        });
    }
    async delete(id) {
        const doc = await this.prisma.extended.document.findUnique({ where: { id } });
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        return this.prisma.extended.document.update({
            where: { id },
            data: { isArchived: true },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map