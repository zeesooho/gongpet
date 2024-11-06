import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/aws/aws.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  async create(dto: CreateProfileDto) {
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId: dto.user_id },
    });

    if (existingProfile) {
      throw new BadRequestException('Profile already exists');
    }

    const createdProfile = await this.prisma.userProfile.create({
      data: {
        userId: dto.user_id,
        nickname: dto.nickname,
        imageUrl: dto.image_url,
      },
    });

    // 생성된 프로필과 함께 user 정보를 가져옵니다
    const user = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
      include: {
        userProfile: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      ageRange: user.ageRange,
      birthday: user.birthday,
      birthdayType: user.birthdayType,
      gender: user.gender,
      registrationAt: user.registrationAt,
      role: user.role,
      from: user.from,
      userProfile: {
        userId: createdProfile.userId,
        nickname: createdProfile.nickname,
        imageUrl: createdProfile.imageUrl,
      },
    };
  }

  async getOneById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.userProfile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      ageRange: user.ageRange,
      birthday: user.birthday,
      birthdayType: user.birthdayType,
      gender: user.gender,
      registrationAt: user.registrationAt,
      role: user.role,
      from: user.from,
      userProfile: {
        userId: user.userProfile.userId,
        nickname: user.userProfile.nickname,
        imageUrl: user.userProfile.imageUrl,
      },
    };
  }

  async update(id: number, dto: UpdateProfileDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userProfile: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (!existingUser.userProfile) {
      throw new NotFoundException('Profile not found');
    }

    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId: id },
      data: {
        ...(dto.nickname && { nickname: dto.nickname }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
    });

    return {
      id: existingUser.id,
      email: existingUser.email,
      ageRange: existingUser.ageRange,
      birthday: existingUser.birthday,
      birthdayType: existingUser.birthdayType,
      gender: existingUser.gender,
      registrationAt: existingUser.registrationAt,
      role: existingUser.role,
      from: existingUser.from,
      userProfile: {
        userId: updatedProfile.userId,
        nickname: updatedProfile.nickname,
        imageUrl: updatedProfile.imageUrl,
      },
    };
  }

  async updateProfileImage(userId: number, file: Express.Multer.File) {
    const imageUrl = await this.saveImage(file);
    const updatedProfile = await this.update(userId, {
      imageUrl: imageUrl,
    });
    return updatedProfile;
  }

  async saveImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    return await this.imageUpload(file);
  }

  async imageUpload(file: Express.Multer.File) {
    const imageName = uuidv4();
    const ext = file.originalname.split('.').pop();

    if (!['jpg', 'jpeg', 'png', 'gif'].includes(ext.toLowerCase())) {
      throw new BadRequestException('Invalid file extension');
    }

    const imageUrl = await this.awsService.imageUploadToS3(`${imageName}.${ext}`, file, ext);

    return imageUrl;
  }

  async deleteImage(imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    const key = imageUrl.split('/').pop();
    await this.awsService.deleteFromS3(key);

    return true;
  }
}
