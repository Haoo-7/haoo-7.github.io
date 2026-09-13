import type {
  RecordViewResult,
  RecordViewSpec,
  VisitorCommand,
} from './contracts/engagement';

export interface RecordViewRepository {
  recordView(input: VisitorCommand): Promise<{ views: number; counted: boolean }>;
}

export class EngagementHandler implements RecordViewSpec {
  constructor(private readonly repository: RecordViewRepository) {}

  async recordView(input: VisitorCommand): Promise<RecordViewResult> {
    try {
      return {
        success: true,
        data: await this.repository.recordView(input),
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: '暂时无法记录浏览量。',
          recoverable: true,
        },
      };
    }
  }
}
