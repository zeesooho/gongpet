import { From } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Transform } from 'class-transformer';

export class CreateUserFromKakaoDto extends CreateUserDto {
  @IsEnum(From)
  @Transform(() => From.KAKAO)
  from: From;
}
