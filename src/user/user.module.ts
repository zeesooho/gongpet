import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserProfileService } from 'src/user-profile/user-profile.service';
import { UserProfileModule } from 'src/user-profile/user-profile.module';

@Module({
  imports: [UserProfileModule, PrismaModule],
  providers: [UserService, UserProfileService],
  exports: [UserService],
})
export class UserModule {}
