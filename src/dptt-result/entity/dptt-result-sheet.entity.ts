import { DpttType } from '@prisma/client';
import { IsArray, IsEnum, IsString } from 'class-validator';

export class DpttResultSheet {
  @IsEnum(DpttType)
  type: DpttType;

  @IsString()
  name: string;

  @IsEnum(DpttType)
  best: DpttType;

  @IsEnum(DpttType)
  worst: DpttType;

  @IsArray()
  comments: string[];
}
