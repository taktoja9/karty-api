import { PartialType } from '@nestjs/mapped-types';
import { CreateGentelmensCardDto } from './create-gentelmens-card.dto';

export class UpdateGentelmensCardDto extends PartialType(CreateGentelmensCardDto) {
  id: number;
}
