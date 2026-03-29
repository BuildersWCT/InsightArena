import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Market } from '../markets/entities/market.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { User } from '../users/entities/user.entity';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Market),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Prediction),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlatformAnalytics', () => {
    it('should call the service and return result', async () => {
      const stats = {
        total_markets: 10,
        active_markets: 5,
        total_predictions: 100,
        total_users: 50,
        total_volume_stroops: '1000000',
        markets_by_category: [
          { category: 'Sports', count: 3 },
          { category: 'Politics', count: 2 },
        ],
        predictions_24h: 10,
        new_users_7d: 5,
      };

      jest.spyOn(service, 'getPlatformAnalytics').mockResolvedValue(stats);

      const result = await controller.getPlatformAnalytics();
      expect(result).toEqual(stats);
      expect(service.getPlatformAnalytics).toHaveBeenCalled();
    });
  });
});
