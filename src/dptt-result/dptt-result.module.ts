import { Module } from '@nestjs/common';
import { DpttResultService } from './dptt-result.service';
import { DpttResultController } from './dptt-result.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [DpttResultController],
  providers: [DpttResultService],
  exports: [DpttResultService],
})
export class DpttResultModule {}
