import { Module } from '@nestjs/common';
import { StrayDogService } from './stray-dog.service';
import { StrayDogController } from './stray-dog.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [StrayDogController],
  providers: [StrayDogService],
})
export class StrayDogModule {}
