import type {
  EngagementData,
  GetEngagementResult,
  GetEngagementSpec,
  VisitorCommand,
} from './contracts/engagement';

export interface EngagementReaderRepository {
  getEngagement(input: VisitorCommand): Promise<EngagementData>;
}

export class ReaderHandler implements GetEngagementSpec {
  constructor(private readonly repository: EngagementReaderRepository) {}

  async getEngagement(input: VisitorCommand): Promise<GetEngagementResult> {
    try {
      return {
        success: true,
        data: await this.repository.getEngagement(input),
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: '暂时无法加载互动数据。',
          recoverable: true,
        },
      };
    }
  }
}
