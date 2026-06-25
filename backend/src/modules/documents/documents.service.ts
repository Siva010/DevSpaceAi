import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const { title, content } = createDocumentDto;

    return this.prisma.extended.document.create({
      data: { title, content } as any,
    });
  }

  async findAll() {
    return this.prisma.extended.document.findMany({
      where: { isArchived: false },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.extended.document.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    return doc;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const doc = await this.prisma.extended.document.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Save a version before updating
    if (doc.content) {
      await this.prisma.extended.documentVersion.create({
        data: { documentId: id, content: doc.content } as any,
      });
    }

    return this.prisma.extended.document.update({
      where: { id },
      data: updateDocumentDto,
    });
  }

  async delete(id: string) {
    const doc = await this.prisma.extended.document.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.extended.document.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
