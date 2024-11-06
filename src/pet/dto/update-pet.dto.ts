import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @MaxLength(12)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(255)
  age?: number;

  @IsOptional()
  birth?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  breed?: string;
}
