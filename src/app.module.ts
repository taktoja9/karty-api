import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GentelmensCardsModule } from './gentelmens-cards/gentelmens-cards.module';

@Module({
  imports: [GentelmensCardsModule],
  providers: [AppService],
})
export class AppModule {}
