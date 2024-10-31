import { IsNumber, IsString } from 'class-validator';
import { IsNullable } from 'src/util/validator';

export class CreateProfileDto {
  @IsNumber()
  user_id: number;

  @IsString()
  nickname: string;

  @IsNullable()
  @IsString()
  image_url: string | null;
}
