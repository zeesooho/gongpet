import { IsBoolean, IsNumber } from 'class-validator';
import { IsNullable } from 'src/util/validator';

export class UpdateDpttResultDto {
  @IsNumber()
  id: number;

  @IsNumber()
  userId: number;

  @IsNullable()
  @IsNumber()
  petId: number | null;

  @IsNullable()
  @IsBoolean()
  retest: boolean | null;

  @IsNumber()
  introversionExtroversion: number;

  @IsNumber()
  dependenceLeadership: number;

  @IsNumber()
  rationalityEmotionality: number;
}
