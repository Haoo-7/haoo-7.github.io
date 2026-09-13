import { describe, expect, it } from 'vitest';
import { CreateCommentInputSchema } from './engagement';

describe('CreateCommentInputSchema', () => {
  it('拒绝无效昵称和超长评论', () => {
    expect(CreateCommentInputSchema.safeParse({
      slug: 'ai-assisted-learning',
      displayName: 'A',
      content: '一条正常评论',
    }).success).toBe(false);

    expect(CreateCommentInputSchema.safeParse({
      slug: 'ai-assisted-learning',
      displayName: 'Haoo',
      content: '评'.repeat(801),
    }).success).toBe(false);

    expect(CreateCommentInputSchema.safeParse({
      slug: 'ai-assisted-learning',
      displayName: 'Haoo',
      content: '评论',
      website: 'https://example.com',
    }).success).toBe(false);
  });
});
