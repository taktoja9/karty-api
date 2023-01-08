import { Module } from '@nestjs/common';
import { GentelmensCardsService } from './gentelmens-cards.service';
import { GentelmensCardsGateway } from './gentelmens-cards.gateway';

@Module({
  providers: [GentelmensCardsGateway, GentelmensCardsService]
})
export class GentelmensCardsModule {}
