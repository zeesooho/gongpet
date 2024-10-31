import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
