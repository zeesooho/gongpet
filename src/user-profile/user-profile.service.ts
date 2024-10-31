import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProfileDto) {
    return await this.prisma.userProfile.create({
      data: {
        userId: dto.user_id,
        nickname: dto.nickname,
        imageUrl: dto.image_url,
      },
    });
  }

  async getOneById(id: number) {
    return await this.prisma.userProfile.findUnique({ where: { userId: id } });
  }

  async update(id: number, dto: UpdateProfileDto) {
    return await this.prisma.userProfile.update({
      where: { userId: id },
      data: dto,
    });
  }
}
