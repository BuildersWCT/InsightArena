import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get('platform')
  @ApiOperation({ summary: 'Get platform-wide analytics' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        total_markets: { type: 'number' },
        active_markets: { type: 'number' },
        total_predictions: { type: 'number' },
        total_users: { type: 'number' },
        total_volume_stroops: { type: 'string' },
        markets_by_category: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        predictions_24h: { type: 'number' },
        new_users_7d: { type: 'number' },
      },
    },
  })
  async getPlatformAnalytics() {
    return this.analyticsService.getPlatformAnalytics();
  }
}
