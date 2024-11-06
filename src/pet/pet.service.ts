import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreatePetDto) {
    return this.prisma.pet.create({
      data: {
        userId,
        name: dto.name,
        age: dto.age,
        birth: dto.birth,
        breed: dto.breed,
      },
    });
  }

  async update(userId: number, petId: number, dto: UpdatePetDto) {
    await this.validatePetOwnership(userId, petId);

    return this.prisma.pet.update({
      where: { id: petId },
      data: {
        name: dto.name,
        age: dto.age,
        birth: dto.birth,
        breed: dto.breed,
      },
    });
  }

  async delete(userId: number, petId: number) {
    await this.validatePetOwnership(userId, petId);

    return this.prisma.pet.delete({
      where: { id: petId },
    });
  }

  async getMyPets(userId: number) {
    return this.prisma.pet.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });
  }

  async getPetById(userId: number, petId: number) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      return [];
    }

    if (pet.userId !== userId) {
      return [];
    }

    return pet;
  }

  private async validatePetOwnership(userId: number, petId: number) {
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        userId,
      },
    });

    if (!pet) {
      throw new NotFoundException('반려견을 찾을 수 없습니다.');
    }

    return pet;
  }
}
