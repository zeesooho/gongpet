import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nickname?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
