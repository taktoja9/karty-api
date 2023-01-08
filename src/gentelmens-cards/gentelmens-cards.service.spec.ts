import { Test, TestingModule } from '@nestjs/testing';
import { GentelmensCardsService } from './gentelmens-cards.service';

describe('GentelmensCardsService', () => {
  let service: GentelmensCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GentelmensCardsService],
    }).compile();

    service = module.get<GentelmensCardsService>(GentelmensCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
