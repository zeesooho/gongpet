import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAccessGuard } from 'src/auth/guard/jwt-access.guard';
import { UserProfileService } from 'src/user-profile/user-profile.service';
import { User } from 'src/auth/decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Get('me')
  async getMyProfile(@User() user) {
    const profile = await this.userProfileService.getOneById(user.userId);
    if (!profile) {
      throw new BadRequestException('Profile not found');
    }
    return profile;
  }
  @Get('me/posts')
  async getMyPosts(
    @User() user,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.userService.getMyPosts(user.userId, page, limit);
  }

  @Get('me/pets')
  async getMyPets(@User() user) {
    return this.userService.getMyPets(user.userId);
  }

  @Get('me/activity')
  async getMyActivity(@User() user) {
    return this.userService.getUserActivity(user.userId);
  }

  @Get('me/bookmarks')
  async getMyBookmarks(
    @User() user,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.userService.getMyBookmarks(user.userId, page, limit);
  }

  @Post('me/profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(@User() user, @UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    console.log('Request headers:', req.headers);
    console.log('File details:', {
      exists: !!file,
      fieldname: file?.fieldname,
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
    });

    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.userProfileService.updateProfileImage(user.userId, file);
  }

  @Delete('me/profile-image')
  async deleteProfileImage(@User() user) {
    // 프로필 이미지 삭제 및 기본 이미지로 변경
    const updatedProfile = await this.userProfileService.update(user.userId, {
      imageUrl: null, // 또는 기본 이미지 URL
    });

    return updatedProfile;
  }
}
