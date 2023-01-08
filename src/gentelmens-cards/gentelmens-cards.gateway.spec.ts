import { Test, TestingModule } from '@nestjs/testing';
import { GentelmensCardsGateway } from './gentelmens-cards.gateway';
import { GentelmensCardsService } from './gentelmens-cards.service';

describe('GentelmensCardsGateway', () => {
  let gateway: GentelmensCardsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GentelmensCardsGateway, GentelmensCardsService],
    }).compile();

    gateway = module.get<GentelmensCardsGateway>(GentelmensCardsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
