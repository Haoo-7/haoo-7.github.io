import { describe, expect, it } from 'vitest';
import { EngagementHandler, type RecordViewRepository } from './engagement-handler';

describe('EngagementHandler.recordView', () => {
  it('返回数据库确认后的浏览量和本次计数状态', async () => {
    const repository: RecordViewRepository = {
      recordView: async () => ({ views: 12, counted: true }),
    };
    const handler = new EngagementHandler(repository);

    await expect(handler.recordView({
      slug: 'ai-assisted-learning',
      visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
    })).resolves.toEqual({
      success: true,
      data: { views: 12, counted: true },
    });
  });
});
