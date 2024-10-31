import { IsEnum, IsIn, IsString } from 'class-validator';

export enum QuestionType {
  introversion_extroversion,
  dependence_leadership,
  rationality_emotionality,
}

export class DpttQuestion {
  @IsString()
  question: string;

  @IsEnum(QuestionType)
  option: QuestionType;

  @IsIn([-1, 1])
  vector: number;
}
