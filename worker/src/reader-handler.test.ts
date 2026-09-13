import { describe, expect, it } from 'vitest';
import { ReaderHandler, type EngagementReaderRepository } from './reader-handler';

describe('ReaderHandler.getEngagement', () => {
  it('一次返回统计、访客点赞状态和已审核评论', async () => {
    const repository: EngagementReaderRepository = {
      getEngagement: async () => ({
        views: 21,
        likes: 5,
        liked: false,
        comments: [{
          id: 1,
          displayName: 'Haoo',
          content: '测试评论',
          website: null,
          createdAt: '2026-07-17T17:00:00.000Z',
        }],
      }),
    };
    const handler = new ReaderHandler(repository);

    const result = await handler.getEngagement({
      slug: 'ai-assisted-learning',
      visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.views).toBe(21);
      expect(result.data.comments).toHaveLength(1);
    }
  });
});
