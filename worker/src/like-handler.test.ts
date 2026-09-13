import { describe, expect, it } from 'vitest';
import { LikeHandler, type LikeRepository } from './like-handler';

describe('LikeHandler.toggleLike', () => {
  it('返回切换后的点赞状态和总数', async () => {
    const repository: LikeRepository = {
      toggleLike: async () => ({ liked: true, likes: 8 }),
    };
    const handler = new LikeHandler(repository);

    await expect(handler.toggleLike({
      slug: 'ai-assisted-learning',
      visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
    })).resolves.toEqual({
      success: true,
      data: { liked: true, likes: 8 },
    });
  });
});
