import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: any) {
    return await this.prisma.pet.create({
      data: {
        userId: userId,
        name: dto.name,
        age: dto.age,
        birth: dto.birth,
        breed: dto.breed,
      },
    });
  }

  async getPetById(id: number) {
    return await this.prisma.pet.findUnique({
      where: { id },
    });
  }

  async getByUserId(userId: number) {
    return await this.prisma.pet.findMany({
      where: { userId },
    });
  }

  async delete(id: number) {
    return await this.prisma.pet.delete({
      where: { id },
    });
  }
}
