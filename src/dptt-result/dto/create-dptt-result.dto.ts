import { IsNumber } from 'class-validator';
import { IsNullable } from 'src/util/validator';

export class CreateDpttResultDto {
  @IsNullable()
  @IsNumber()
  petId: number | null;

  @IsNumber()
  introversionExtroversion: number;

  @IsNumber()
  dependenceLeadership: number;

  @IsNumber()
  rationalityEmotionality: number;
}
