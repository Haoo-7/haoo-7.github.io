import { renderSafeMarkdown } from './verification';

export type ModerationStatus = 'approved' | 'pending' | 'rejected';
export type ModerationAction = 'approve' | 'reject' | 'delete';

export interface ModerationComment {
  id: number;
  slug: string;
  status: ModerationStatus;
  displayName: string;
  content: string;
  contentHtml: string;
  createdAt: string;
}

export interface AdminRepository {
  listComments(input: { status: ModerationStatus; limit: number; cursor?: number }): Promise<{
    comments: ModerationComment[];
    nextCursor: string | null;
  }>;
  updateCommentStatus(id: number, status: Exclude<ModerationStatus, 'pending'>): Promise<ModerationComment | null>;
  deleteComment(id: number): Promise<boolean>;
  recordAudit(input: {
    commentId: number;
    adminId: string;
    action: ModerationAction;
    previousStatus?: ModerationStatus;
    nextStatus?: Exclude<ModerationStatus, 'pending'>;
  }): Promise<void>;
}

export class AdminModerationHandler {
  constructor(private readonly repository: AdminRepository) {}

  async list(status: ModerationStatus, limit: number, cursor?: number) {
    return this.repository.listComments({ status, limit, cursor });
  }

  async moderate(
    commentId: number,
    action: ModerationAction,
    adminId: string,
  ):
    Promise<
      | { success: true; data: { comment?: ModerationComment; deleted?: boolean } }
      | { success: false; error: { code: 'NOT_FOUND' | 'DATABASE_ERROR'; message: string; recoverable: boolean } }
    > {
    try {
      if (action === 'delete') {
        const deleted = await this.repository.deleteComment(commentId);
        if (!deleted) return this.notFound();
        await this.repository.recordAudit({ commentId, adminId, action });
        return { success: true, data: { deleted: true } };
      }

      const nextStatus = action === 'approve' ? 'approved' : 'rejected';
      const comment = await this.repository.updateCommentStatus(commentId, nextStatus);
      if (!comment) return this.notFound();
      await this.repository.recordAudit({
        commentId,
        adminId,
        action,
        previousStatus: comment.status,
        nextStatus,
      });
      return { success: true, data: { comment } };
    } catch {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: '审核操作暂时无法完成。',
          recoverable: true,
        },
      };
    }
  }

  static toModerationComment(input: Omit<ModerationComment, 'contentHtml'>): ModerationComment {
    return { ...input, contentHtml: renderSafeMarkdown(input.content) };
  }

  private notFound() {
    return {
      success: false as const,
      error: {
        code: 'NOT_FOUND' as const,
        message: '评论不存在。',
        recoverable: false,
      },
    };
  }
}
