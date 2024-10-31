import { DpttQuestion } from './dptt-question.entity';
import { DpttResultSheet } from './dptt-result-sheet.entity';

export class DpttTestSheet {
  questions: DpttQuestion[];
  results: DpttResultSheet[];
}
