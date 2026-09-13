import { describe, expect, it, vi } from 'vitest';
import { CommentHandler, type CommentRepository } from './comment-handler';

describe('CommentHandler.createComment', () => {
  it('超过评论频率限制时不写入数据库', async () => {
    const createComment = vi.fn<CommentRepository['createComment']>();
    const repository: CommentRepository = {
      consumeAllowance: async () => false,
      createComment,
    };
    const handler = new CommentHandler(repository);

    const result = await handler.createComment({
      slug: 'ai-assisted-learning',
      visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
      displayName: 'Haoo',
      content: '这是一条测试评论。',
      status: 'approved',
    });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: '评论太频繁，请稍后再试。',
        recoverable: true,
      },
    });
    expect(createComment).not.toHaveBeenCalled();
  });
});
