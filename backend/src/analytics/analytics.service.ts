import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Brackets } from 'typeorm';
import { Market } from '../markets/entities/market.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private cache: { data: any; timestamp: number } | null = null;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor(
    @InjectRepository(Market)
    private readonly marketRepository: Repository<Market>,
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getPlatformAnalytics() {
    const now = Date.now();

    if (this.cache && now - this.cache.timestamp < this.CACHE_TTL) {
      this.logger.log('Returning platform analytics from cache');
      return this.cache.data;
    }

    this.logger.log('Fetching platform analytics from database');
    const data = await this.aggregatePlatformStats();
    this.cache = { data, timestamp: now };

    return data;
  }

  private async aggregatePlatformStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total_markets,
      active_markets,
      total_predictions,
      total_users,
      volumeResult,
      markets_by_category,
      predictions_24h,
      new_users_7d,
    ] = await Promise.all([
      this.marketRepository.count(),
      this.marketRepository.count({
        where: {
          is_resolved: false,
          is_cancelled: false,
          end_time: MoreThan(now),
        },
      }),
      this.predictionRepository.count(),
      this.userRepository.count(),
      this.marketRepository
        .createQueryBuilder('market')
        .select('SUM(CAST(market.total_pool_stroops AS NUMERIC))', 'sum')
        .getRawOne(),
      this.marketRepository
        .createQueryBuilder('market')
        .select('market.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('market.category')
        .getRawMany(),
      this.predictionRepository.count({
        where: {
          submitted_at: MoreThan(last24h),
        },
      }),
      this.userRepository.count({
        where: {
          created_at: MoreThan(last7d),
        },
      }),
    ]);

    return {
      total_markets,
      active_markets,
      total_predictions,
      total_users,
      total_volume_stroops: volumeResult?.sum?.toString() || '0',
      markets_by_category: markets_by_category.map((m) => ({
        category: m.category,
        count: parseInt(m.count, 10),
      })),
      predictions_24h,
      new_users_7d,
    };
  }
}
