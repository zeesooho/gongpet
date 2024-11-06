import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserProfileService } from 'src/user-profile/user-profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from './user.controller';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [UserController],
  providers: [UserService, UserProfileService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
