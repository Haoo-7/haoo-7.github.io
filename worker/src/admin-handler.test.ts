import { describe, expect, it, vi } from 'vitest';
import { AdminModerationHandler, type AdminRepository } from './admin-handler';

describe('AdminModerationHandler', () => {
  it('approves a comment and records the moderation audit', async () => {
    const repository: AdminRepository = {
      listComments: vi.fn(async () => ({ comments: [], nextCursor: null })),
      updateCommentStatus: vi.fn(async () => ({
        id: 7,
        slug: 'ai-assisted-learning',
        status: 'approved' as const,
        displayName: 'Reader',
        content: 'Hello',
        contentHtml: '<p>Hello</p>',
        createdAt: '2026-07-18T00:00:00.000Z',
      })),
      deleteComment: vi.fn(async () => true),
      recordAudit: vi.fn(async () => undefined),
    };
    const handler = new AdminModerationHandler(repository);

    const result = await handler.moderate(7, 'approve', 'local-admin');

    expect(result).toMatchObject({ success: true, data: { comment: { status: 'approved' } } });
    expect(repository.recordAudit).toHaveBeenCalledWith(expect.objectContaining({
      commentId: 7,
      action: 'approve',
      adminId: 'local-admin',
    }));
  });
});
