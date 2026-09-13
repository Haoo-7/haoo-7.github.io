import type { CreateCommentCommand, EngagementData, PublicComment, VisitorCommand } from './contracts/engagement';
import type { ApiRepository } from './index';
import type {
  EmailCodeRecord,
  EmailSessionRecord,
  EmailVerificationRepository,
} from './verification-handler';
import { renderSafeMarkdown } from './verification';
import type { AdminRepository, ModerationComment, ModerationStatus } from './admin-handler';

interface CommentRow {
  id: number;
  display_name: string;
  content: string;
  website: string | null;
  created_at: string;
}

interface EmailCodeRow {
  email_hmac: string;
  code_digest: string;
  expires_at: number;
  last_sent_at: number;
  attempts: number;
}

interface EmailSessionRow {
  email_hmac: string;
  expires_at: number;
}

interface AdminCommentRow {
  id: number;
  slug: string;
  status: ModerationStatus;
  display_name: string;
  content: string;
  website: string | null;
  created_at: string;
}

export class D1EngagementRepository implements ApiRepository, EmailVerificationRepository, AdminRepository {
  constructor(private readonly database: D1Database) {}

  async getEngagement(input: VisitorCommand): Promise<EngagementData> {
    const [views, likes, liked, commentRows] = await Promise.all([
      this.database.prepare('SELECT views FROM article_stats WHERE slug = ?')
        .bind(input.slug)
        .first<number>('views'),
      this.database.prepare('SELECT COUNT(*) AS count FROM article_likes WHERE slug = ?')
        .bind(input.slug)
        .first<number>('count'),
      this.database.prepare('SELECT 1 AS liked FROM article_likes WHERE slug = ? AND visitor_id = ?')
        .bind(input.slug, input.visitorId)
        .first<number>('liked'),
      this.database.prepare(`
        SELECT id, display_name, content, website, created_at
        FROM comments
        WHERE slug = ? AND status = 'approved' AND (? IS NULL OR id < ?)
        ORDER BY created_at DESC, id DESC
        LIMIT 21
      `).bind(input.slug, input.commentCursor ?? null, input.commentCursor ?? null).all<CommentRow>(),
    ]);

    const commentResults = commentRows.results as CommentRow[];
    const hasNextComments = commentResults.length > 20;
    const comments = commentResults.slice(0, 20);

    return {
      views: views ?? 0,
      likes: likes ?? 0,
      liked: liked === 1,
      comments: comments.map((row) => this.toPublicComment(row)),
      nextCursor: hasNextComments ? String(comments.at(-1)?.id ?? '') : null,
    };
  }

  async recordView(input: VisitorCommand): Promise<{ views: number; counted: boolean }> {
    const viewedOn = new Date().toISOString().slice(0, 10);
    const insertion = await this.database.prepare(`
      INSERT OR IGNORE INTO article_views (slug, visitor_id, viewed_on)
      VALUES (?, ?, ?)
    `).bind(input.slug, input.visitorId, viewedOn).run();
    const counted = (insertion.meta.changes ?? 0) > 0;

    if (counted) {
      await this.database.prepare(`
        INSERT INTO article_stats (slug, views, updated_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(slug) DO UPDATE SET
          views = views + 1,
          updated_at = CURRENT_TIMESTAMP
      `).bind(input.slug).run();
    }

    const views = await this.database.prepare('SELECT views FROM article_stats WHERE slug = ?')
      .bind(input.slug)
      .first<number>('views');
    return { views: views ?? 0, counted };
  }

  async toggleLike(input: VisitorCommand): Promise<{ liked: boolean; likes: number }> {
    const existing = await this.database.prepare(`
      SELECT 1 AS liked FROM article_likes WHERE slug = ? AND visitor_id = ?
    `).bind(input.slug, input.visitorId).first<number>('liked');

    let liked: boolean;
    if (existing === 1) {
      await this.database.prepare('DELETE FROM article_likes WHERE slug = ? AND visitor_id = ?')
        .bind(input.slug, input.visitorId)
        .run();
      liked = false;
    } else {
      await this.database.prepare(`
        INSERT OR IGNORE INTO article_likes (slug, visitor_id) VALUES (?, ?)
      `).bind(input.slug, input.visitorId).run();
      liked = true;
    }

    const likes = await this.database.prepare('SELECT COUNT(*) AS count FROM article_likes WHERE slug = ?')
      .bind(input.slug)
      .first<number>('count');
    return { liked, likes: likes ?? 0 };
  }

  async consumeAllowance(input: CreateCommentCommand): Promise<boolean> {
    const windowStart = new Date(Math.floor(Date.now() / 600_000) * 600_000).toISOString();
    await this.database.prepare(`
      INSERT INTO comment_rate_limits (visitor_id, window_start, request_count)
      VALUES (?, ?, 1)
      ON CONFLICT(visitor_id, window_start) DO UPDATE SET
        request_count = request_count + 1
    `).bind(input.visitorId, windowStart).run();

    const requestCount = await this.database.prepare(`
      SELECT request_count FROM comment_rate_limits WHERE visitor_id = ? AND window_start = ?
    `).bind(input.visitorId, windowStart).first<number>('request_count');
    return (requestCount ?? 1) <= 3;
  }

  async createComment(input: CreateCommentCommand): Promise<PublicComment> {
    const row = await this.database.prepare(`
      INSERT INTO comments (
        slug, visitor_id, display_name, content, website, email_hmac, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id, display_name, content, website, created_at
    `).bind(
      input.slug,
      input.visitorId,
      input.displayName,
      input.content,
      null,
      input.emailHmac ?? null,
      input.status,
    ).first<CommentRow>();

    if (!row) throw new Error('D1 did not return the created comment.');
    return this.toPublicComment(row);
  }

  private toPublicComment(row: CommentRow): PublicComment {
    return {
      id: row.id,
      displayName: row.display_name,
      content: row.content,
      contentHtml: renderSafeMarkdown(row.content),
      createdAt: new Date(`${row.created_at.replace(' ', 'T')}Z`).toISOString(),
    };
  }

  async getCode(emailHmac: string): Promise<EmailCodeRecord | null> {
    const row = await this.database.prepare(`
      SELECT email_hmac, code_digest, expires_at, last_sent_at, attempts
      FROM email_verification_codes
      WHERE email_hmac = ?
    `).bind(emailHmac).first<EmailCodeRow>();
    return row ? {
      emailHmac: row.email_hmac,
      codeDigest: row.code_digest,
      expiresAt: row.expires_at,
      lastSentAt: row.last_sent_at,
      attempts: row.attempts,
    } : null;
  }

  async saveCode(input: EmailCodeRecord): Promise<void> {
    await this.database.prepare(`
      INSERT INTO email_verification_codes (
        email_hmac, code_digest, expires_at, last_sent_at, attempts
      ) VALUES (?, ?, ?, ?, 0)
      ON CONFLICT(email_hmac) DO UPDATE SET
        code_digest = excluded.code_digest,
        expires_at = excluded.expires_at,
        last_sent_at = excluded.last_sent_at,
        attempts = 0
    `).bind(
      input.emailHmac,
      input.codeDigest,
      input.expiresAt,
      input.lastSentAt,
    ).run();
  }

  async incrementAttempts(emailHmac: string): Promise<number> {
    await this.database.prepare(`
      UPDATE email_verification_codes
      SET attempts = attempts + 1
      WHERE email_hmac = ?
    `).bind(emailHmac).run();
    const row = await this.database.prepare(`
      SELECT attempts FROM email_verification_codes WHERE email_hmac = ?
    `).bind(emailHmac).first<{ attempts: number }>();
    return row?.attempts ?? 5;
  }

  async consumeCode(emailHmac: string): Promise<void> {
    await this.database.prepare('DELETE FROM email_verification_codes WHERE email_hmac = ?')
      .bind(emailHmac)
      .run();
  }

  async createSession(input: { tokenDigest: string; emailHmac: string; expiresAt: number }): Promise<void> {
    await this.database.prepare(`
      INSERT INTO comment_verification_sessions (token_digest, email_hmac, expires_at)
      VALUES (?, ?, ?)
    `).bind(input.tokenDigest, input.emailHmac, input.expiresAt).run();
  }

  async getSession(tokenDigest: string): Promise<EmailSessionRecord | null> {
    const row = await this.database.prepare(`
      SELECT email_hmac, expires_at
      FROM comment_verification_sessions
      WHERE token_digest = ? AND expires_at > ?
    `).bind(tokenDigest, Date.now()).first<EmailSessionRow>();
    return row ? { emailHmac: row.email_hmac, expiresAt: row.expires_at } : null;
  }

  async cleanupExpiredVerification(now = Date.now()): Promise<void> {
    await this.database.batch([
      this.database.prepare('DELETE FROM email_verification_codes WHERE expires_at <= ?').bind(now),
      this.database.prepare('DELETE FROM comment_verification_sessions WHERE expires_at <= ?').bind(now),
      this.database.prepare(`DELETE FROM comment_rate_limits WHERE window_start < ?`)
        .bind(new Date(now - 24 * 60 * 60 * 1000).toISOString()),
    ]);
  }

  async listComments(input: { status: ModerationStatus; limit: number; cursor?: number }): Promise<{
    comments: ModerationComment[];
    nextCursor: string | null;
  }> {
    const rows = await this.database.prepare(`
      SELECT id, slug, status, display_name, content, website, created_at
      FROM comments
      WHERE status = ? AND (? IS NULL OR id < ?)
      ORDER BY id DESC
      LIMIT ?
    `).bind(input.status, input.cursor ?? null, input.cursor ?? null, input.limit + 1).all<AdminCommentRow>();
    const results = rows.results as AdminCommentRow[];
    const hasNext = results.length > input.limit;
    const comments = results.slice(0, input.limit).map((row) => this.toModerationComment(row));
    return {
      comments,
      nextCursor: hasNext ? String(comments.at(-1)?.id ?? '') : null,
    };
  }

  async updateCommentStatus(id: number, status: Exclude<ModerationStatus, 'pending'>): Promise<ModerationComment | null> {
    const row = await this.database.prepare(`
      UPDATE comments SET status = ? WHERE id = ?
      RETURNING id, slug, status, display_name, content, website, created_at
    `).bind(status, id).first<AdminCommentRow>();
    return row ? this.toModerationComment(row) : null;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await this.database.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
    return (result.meta.changes ?? 0) > 0;
  }

  async recordAudit(input: {
    commentId: number;
    adminId: string;
    action: 'approve' | 'reject' | 'delete';
    previousStatus?: ModerationStatus;
    nextStatus?: Exclude<ModerationStatus, 'pending'>;
  }): Promise<void> {
    await this.database.prepare(`
      INSERT INTO moderation_audit (
        comment_id, admin_id, action, previous_status, next_status
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      input.commentId,
      input.adminId,
      input.action,
      input.previousStatus ?? null,
      input.nextStatus ?? null,
    ).run();
  }

  private toModerationComment(row: AdminCommentRow): ModerationComment {
    return {
      id: row.id,
      slug: row.slug,
      status: row.status,
      displayName: row.display_name,
      content: row.content,
      contentHtml: renderSafeMarkdown(row.content),
      createdAt: new Date(`${row.created_at.replace(' ', 'T')}Z`).toISOString(),
    };
  }
}
