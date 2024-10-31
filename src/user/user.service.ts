import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserFromKakaoDto } from './dto/create-user-from-kakao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserProfileService } from 'src/user-profile/user-profile.service';
import { From, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateProfileDto } from 'src/user-profile/dto/create-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userProfileService: UserProfileService,
  ) {}

  // 카카오 사용자로부터 새 사용자 생성
  async createFromKakao(dto: CreateUserFromKakaoDto): Promise<User> {
    return await this.create(dto);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.getUserByEmail(dto.email, dto.from);

    if (user) return user;

    const currentTime = new Date();

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        birthday: dto.birthday,
        gender: dto.gender,
        ageRange: dto.age_range,
        role: dto.role,
        from: dto.from,
        registrationAt: currentTime,
      },
    });

    const userProfileDto: CreateProfileDto = {
      user_id: newUser.id,
      nickname: dto.nickname,
      image_url: null,
    };

    const userProfile = await this.userProfileService.create(userProfileDto);

    if (!userProfile) {
      await this.delete(newUser.id);
      throw new HttpException('Server error', 500);
    }

    return newUser;
  }

  async getUserByid(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  async getUserByEmail(email: string, from: From) {
    const user = await this.prisma.user.findFirst({
      where: { email, from },
    });
    return user;
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
