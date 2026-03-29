import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { Market } from '../markets/entities/market.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { User } from '../users/entities/user.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockMarketRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
    })),
  };

  const mockPredictionRepository = {
    count: jest.fn(),
  };

  const mockUserRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Market),
          useValue: mockMarketRepository,
        },
        {
          provide: getRepositoryToken(Prediction),
          useValue: mockPredictionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlatformAnalytics', () => {
    it('should return aggregated platform stats and cache them', async () => {
      mockMarketRepository.count.mockResolvedValueOnce(10).mockResolvedValueOnce(5);
      mockPredictionRepository.count.mockResolvedValueOnce(100);
      mockUserRepository.count.mockResolvedValueOnce(50);
      
      const queryBuilder = mockMarketRepository.createQueryBuilder();
      (queryBuilder.getRawOne as jest.Mock).mockResolvedValue({ sum: '1000000' });
      (queryBuilder.getRawMany as jest.Mock).mockResolvedValue([
        { category: 'Sports', count: '3' },
        { category: 'Politics', count: '2' },
      ]);

      mockPredictionRepository.count.mockResolvedValueOnce(10); // predictions_24h
      mockUserRepository.count.mockResolvedValueOnce(5); // new_users_7d

      const result = await service.getPlatformAnalytics();

      expect(result).toEqual({
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
      });

      // Second call should come from cache
      const resultCached = await service.getPlatformAnalytics();
      expect(resultCached).toEqual(result);
      expect(mockMarketRepository.count).toHaveBeenCalledTimes(2); // Only called for the first aggregation
    });
  });
});
