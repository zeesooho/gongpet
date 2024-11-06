import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [PrismaModule, AwsModule],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
