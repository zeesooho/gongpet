import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreatePetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(12)
  name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(255)
  age: number;

  @IsOptional()
  birth?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  breed?: string;
}
