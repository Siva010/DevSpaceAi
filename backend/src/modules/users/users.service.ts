import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateData: { fullName?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, fullName: true, createdAt: true },
    });
    return user;
  }
}
