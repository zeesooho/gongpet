import { From, Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { IsNullable } from 'src/util/validator';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsString()
  email: string;

  @IsNullable()
  @IsString()
  name: string | null;

  @IsNullable()
  @IsString()
  birthday: string | null;

  @IsNullable()
  @IsString()
  age_range: string | null;

  @IsNullable()
  @IsString()
  gender: string | null;

  @IsEnum(Role)
  @Transform(() => Role.USER)
  role: Role = Role.USER;

  @IsEnum(From)
  from: From;
}
