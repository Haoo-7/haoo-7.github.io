import {
  CreateCommentCommandSchema,
  CreateCommentInputSchema,
  RequestEmailCodeInputSchema,
  VerifyEmailCodeInputSchema,
  VisitorCommandSchema,
} from './contracts/engagement';
import { ReaderHandler, type EngagementReaderRepository } from './reader-handler';
import { EngagementHandler, type RecordViewRepository } from './engagement-handler';
import { LikeHandler, type LikeRepository } from './like-handler';
import { CommentHandler, type CommentRepository } from './comment-handler';
import { D1EngagementRepository } from './d1-repository';
import { fetchMusicPlaylist, type MusicFetcher } from './music-handler';
import {
  EmailVerificationHandler,
  type EmailVerificationRepository,
  type VerificationEmail,
} from './verification-handler';
import { AdminModerationHandler, type AdminRepository, type ModerationAction, type ModerationStatus } from './admin-handler';
import { authenticateAdmin } from './admin-auth';

const MUSIC_PLAYLIST_ID = '2794581085';
const DEFAULT_METING_API_PRIMARY_URL = 'https://api.injahow.cn/meting/';
const DEFAULT_METING_API_FALLBACK_URL = 'https://api.i-meto.com/meting/api';

export interface ApiRepository extends
  EngagementReaderRepository,
  RecordViewRepository,
  LikeRepository,
  CommentRepository {}

export interface ApiContext {
  repository: ApiRepository;
  visitorId: string;
  environment: 'development' | 'production';
  verifyTurnstile?: (token: string) => Promise<boolean>;
  musicFetcher?: MusicFetcher;
  musicPrimaryUrl?: string;
  musicFallbackUrl?: string;
  emailHmacSecret?: string;
  verificationRepository?: EmailVerificationRepository;
  sendVerificationEmail?: (input: VerificationEmail) => Promise<void>;
  adminRepository?: AdminRepository;
  localAdminToken?: string;
  accessTeamDomain?: string;
  accessAudience?: string;
  notifyAdmin?: (input: { slug: string; displayName: string; content: string }) => Promise<void>;
}

function jsonResponse(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function withCookie(response: Response, name: string, value: string, maxAge: number, secure: boolean): Response {
  const headers = new Headers(response.headers);
  headers.append(
    'Set-Cookie',
    `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`,
  );
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function readCookie(cookieHeader: string | null, name: string): string | undefined {
  return cookieHeader
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)?.[1];
}

function verificationHandler(context: ApiContext): EmailVerificationHandler | null {
  if (!context.verificationRepository || !context.emailHmacSecret) return null;
  return new EmailVerificationHandler(context.verificationRepository, {
    secret: context.emailHmacSecret,
    sendEmail: context.sendVerificationEmail ?? (async () => undefined),
    exposeCode: context.environment === 'development' && !context.sendVerificationEmail,
  });
}

export async function handleApiRequest(request: Request, context: ApiContext): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname === '/api/comments/verification/request') {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: '邮箱格式无效。', recoverable: true } }, 400);
    }
    const input = RequestEmailCodeInputSchema.safeParse(body);
    const handler = verificationHandler(context);
    if (!input.success) {
      return jsonResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: '请输入有效邮箱。', recoverable: true } }, 400);
    }
    if (!handler) {
      return jsonResponse({ success: false, error: { code: 'EMAIL_UNAVAILABLE', message: '验证码服务尚未配置。', recoverable: false } }, 503);
    }
    const result = await handler.requestCode(input.data.email);
    return jsonResponse(result, result.success ? 200 : result.error.code === 'RATE_LIMITED' ? 429 : 503);
  }

  if (request.method === 'GET' && url.pathname === '/api/comments/verification/status') {
    const handler = verificationHandler(context);
    const sessionToken = readCookie(request.headers.get('Cookie'), 'haoo_comment_session');
    const session = handler && sessionToken ? await handler.getSession(sessionToken) : null;
    return jsonResponse(session
      ? { success: true, data: { verified: true, expiresAt: session.expiresAt } }
      : { success: true, data: { verified: false } });
  }

  if (request.method === 'POST' && url.pathname === '/api/comments/verification/verify') {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: '验证码格式无效。', recoverable: true } }, 400);
    }
    const input = VerifyEmailCodeInputSchema.safeParse(body);
    const handler = verificationHandler(context);
    if (!input.success) {
      return jsonResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: '请输入邮箱和 6 位验证码。', recoverable: true } }, 400);
    }
    if (!handler) {
      return jsonResponse({ success: false, error: { code: 'EMAIL_UNAVAILABLE', message: '验证码服务尚未配置。', recoverable: false } }, 503);
    }
    const result = await handler.verifyCode(input.data.email, input.data.code);
    const response = jsonResponse(result, result.success ? 200 : 400);
    return result.success
      ? withCookie(response, 'haoo_comment_session', result.data.sessionToken, 90 * 24 * 60 * 60, url.protocol === 'https:')
      : response;
  }

  if (request.method === 'GET' && url.pathname === '/api/music/playlist') {
    return jsonResponse(await fetchMusicPlaylist(context.musicFetcher ?? fetch, {
      playlistId: MUSIC_PLAYLIST_ID,
      primaryUrl: context.musicPrimaryUrl ?? DEFAULT_METING_API_PRIMARY_URL,
      fallbackUrl: context.musicFallbackUrl ?? DEFAULT_METING_API_FALLBACK_URL,
    }));
  }

  if (url.pathname.startsWith('/api/admin/')) {
    const auth = await authenticateAdmin(request, {
      environment: context.environment,
      localToken: context.localAdminToken,
      teamDomain: context.accessTeamDomain,
      audience: context.accessAudience,
    });
    if (!auth.authenticated) {
      return jsonResponse({
        success: false,
        error: { code: 'ADMIN_UNAUTHORIZED', message: '需要管理员权限。', recoverable: false },
      }, 401);
    }
    if (!context.adminRepository) {
      return jsonResponse({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '审核服务尚未配置。', recoverable: false },
      }, 503);
    }

    const handler = new AdminModerationHandler(context.adminRepository);
    const commentsMatch = url.pathname.match(/^\/api\/admin\/comments(?:\/([0-9]+))?$/);
    if (!commentsMatch) {
      return jsonResponse({
        success: false,
        error: { code: 'NOT_FOUND', message: '接口不存在。', recoverable: false },
      }, 404);
    }

    if (request.method === 'GET' && !commentsMatch[1]) {
      const statusValue = url.searchParams.get('status') ?? 'pending';
      const status: ModerationStatus = statusValue === 'approved' || statusValue === 'rejected'
        ? statusValue
        : 'pending';
      const parsedLimit = Number(url.searchParams.get('limit') ?? 20);
      const limit = Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 20;
      const cursorValue = Number(url.searchParams.get('cursor'));
      const result = await handler.list(status, limit, Number.isInteger(cursorValue) && cursorValue > 0 ? cursorValue : undefined);
      return jsonResponse({ success: true, data: result });
    }

    if (request.method === 'PATCH' && commentsMatch[1]) {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: '审核动作格式无效。', recoverable: true } }, 400);
      }
      const action = typeof body === 'object' && body !== null && 'action' in body
        ? (body as { action?: unknown }).action
        : undefined;
      if (action !== 'approve' && action !== 'reject' && action !== 'delete') {
        return jsonResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: '审核动作无效。', recoverable: true } }, 400);
      }
      const result = await handler.moderate(Number(commentsMatch[1]), action as ModerationAction, auth.subject ?? auth.email ?? 'access-admin');
      return jsonResponse(result, result.success ? 200 : result.error.code === 'NOT_FOUND' ? 404 : 500);
    }
  }

  const match = url.pathname.match(/^\/api\/posts\/([^/]+)\/engagement$/);

  if (request.method === 'GET' && match) {
    const cursorValue = Number(url.searchParams.get('cursor'));
    const input = VisitorCommandSchema.safeParse({
      slug: decodeURIComponent(match[1]),
      visitorId: context.visitorId,
      commentCursor: Number.isInteger(cursorValue) && cursorValue > 0 ? cursorValue : undefined,
    });
    if (!input.success) {
      return jsonResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '文章标识无效。',
          recoverable: false,
        },
      }, 400);
    }

    return jsonResponse(await new ReaderHandler(context.repository).getEngagement(input.data));
  }

  const viewMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/view$/);
  if (request.method === 'POST' && viewMatch) {
    const input = VisitorCommandSchema.safeParse({
      slug: decodeURIComponent(viewMatch[1]),
      visitorId: context.visitorId,
    });
    if (!input.success) {
      return jsonResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '文章标识无效。',
          recoverable: false,
        },
      }, 400);
    }

    return jsonResponse(await new EngagementHandler(context.repository).recordView(input.data));
  }

  const likeMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/like$/);
  if (request.method === 'POST' && likeMatch) {
    const input = VisitorCommandSchema.safeParse({
      slug: decodeURIComponent(likeMatch[1]),
      visitorId: context.visitorId,
    });
    if (!input.success) {
      return jsonResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '文章标识无效。',
          recoverable: false,
        },
      }, 400);
    }

    return jsonResponse(await new LikeHandler(context.repository).toggleLike(input.data));
  }

  const commentsMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
  if (request.method === 'POST' && commentsMatch) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '评论内容格式无效。',
          recoverable: true,
        },
      }, 400);
    }

    const parsedBody = CreateCommentInputSchema.safeParse({
      ...(typeof body === 'object' && body !== null ? body : {}),
      slug: decodeURIComponent(commentsMatch[1]),
    });
    if (!parsedBody.success) {
      return jsonResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '昵称、评论内容或个人链接不符合要求。',
          recoverable: true,
        },
      }, 400);
    }

    if (context.environment === 'production') {
      if (!context.verifyTurnstile) {
        return jsonResponse({
          success: false,
          error: {
            code: 'TURNSTILE_REQUIRED',
            message: '评论验证服务尚未配置。',
            recoverable: false,
          },
        }, 503);
      }

      if (!parsedBody.data.turnstileToken) {
        return jsonResponse({
          success: false,
          error: {
            code: 'TURNSTILE_REQUIRED',
            message: '请先完成人机验证。',
            recoverable: true,
          },
        }, 400);
      }

      if (!await context.verifyTurnstile(parsedBody.data.turnstileToken)) {
        return jsonResponse({
          success: false,
          error: {
            code: 'TURNSTILE_FAILED',
            message: '人机验证失败，请重试。',
            recoverable: true,
          },
        }, 403);
      }
    }

    let emailHmac: string | undefined;
    if (context.verificationRepository) {
      const handler = verificationHandler(context);
      const sessionToken = readCookie(request.headers.get('Cookie'), 'haoo_comment_session');
      const session = handler && sessionToken ? await handler.getSession(sessionToken) : null;
      if (!session) {
        return jsonResponse({
          success: false,
          error: {
            code: 'VERIFICATION_REQUIRED',
            message: '请先验证邮箱后再发表评论。',
            recoverable: true,
          },
        }, 401);
      }
      emailHmac = session.emailHmac;
    }

    const command = CreateCommentCommandSchema.parse({
      ...parsedBody.data,
      visitorId: context.visitorId,
      status: context.environment === 'production' ? 'pending' : 'approved',
      emailHmac,
    });
    const result = await new CommentHandler(context.repository).createComment(command);
    if (result.success && result.data.pending && context.notifyAdmin) {
      void context.notifyAdmin({
        slug: command.slug,
        displayName: command.displayName,
        content: command.content,
      }).catch(() => undefined);
    }
    const status = result.success ? 201 : result.error.code === 'RATE_LIMITED' ? 429 : 500;
    return jsonResponse(result, status);
  }

  return jsonResponse({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在。',
      recoverable: false,
    },
  }, 404);
}

interface WorkerEnv {
  ASSETS: Fetcher;
  DB: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL_HMAC_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ADMIN_NOTIFICATION_EMAIL?: string;
  LOCAL_ADMIN_TOKEN?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  METING_API_PRIMARY_URL?: string;
  METING_API_FALLBACK_URL?: string;
}

function readVisitorId(cookieHeader: string | null): { visitorId: string; isNew: boolean } {
  const storedVisitor = cookieHeader
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([name]) => name === 'haoo_visitor')?.[1];
  const parsedVisitor = VisitorCommandSchema.shape.visitorId.safeParse(storedVisitor);

  return parsedVisitor.success
    ? { visitorId: parsedVisitor.data, isNew: false }
    : { visitorId: crypto.randomUUID(), isNew: true };
}

function withVisitorCookie(response: Response, visitorId: string, secure: boolean): Response {
  const headers = new Headers(response.headers);
  headers.append(
    'Set-Cookie',
    `haoo_visitor=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`,
  );
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function createTurnstileVerifier(secret: string): (token: string) => Promise<boolean> {
  return async (token) => {
    const form = new FormData();
    form.set('secret', secret);
    form.set('response', token);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  };
}

function createResendSender(apiKey: string, from: string): (input: VerificationEmail) => Promise<void> {
  return async ({ email, code }) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Haoo Blog 评论验证码',
        text: `你的验证码是 ${code}，10 分钟内有效。`,
      }),
    });
    if (!response.ok) throw new Error(`Resend returned ${response.status}`);
  };
}

function createAdminNotificationSender(apiKey: string, from: string, to: string): NonNullable<ApiContext['notifyAdmin']> {
  return async ({ slug, displayName, content }) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Haoo Blog 有新的待审评论：${slug}`,
        text: `${displayName} 在 ${slug} 发布了待审评论：\n\n${content}`,
      }),
    });
    if (!response.ok) throw new Error(`Resend returned ${response.status}`);
  };
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    const visitor = readVisitorId(request.headers.get('Cookie'));
    const isLocal = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
    const repository = new D1EngagementRepository(env.DB);
    const response = await handleApiRequest(request, {
      repository,
      visitorId: visitor.visitorId,
      environment: isLocal ? 'development' : 'production',
      verifyTurnstile: env.TURNSTILE_SECRET_KEY
        ? createTurnstileVerifier(env.TURNSTILE_SECRET_KEY)
        : undefined,
      musicPrimaryUrl: env.METING_API_PRIMARY_URL,
      musicFallbackUrl: env.METING_API_FALLBACK_URL,
      emailHmacSecret: env.EMAIL_HMAC_SECRET ?? (isLocal ? 'local-development-email-hmac-secret' : undefined),
      verificationRepository: repository,
      sendVerificationEmail: env.RESEND_API_KEY && env.RESEND_FROM_EMAIL
        ? createResendSender(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL)
        : undefined,
      adminRepository: repository,
      localAdminToken: env.LOCAL_ADMIN_TOKEN,
      accessTeamDomain: env.CF_ACCESS_TEAM_DOMAIN,
      accessAudience: env.CF_ACCESS_AUD,
      notifyAdmin: env.RESEND_API_KEY && env.RESEND_FROM_EMAIL && env.ADMIN_NOTIFICATION_EMAIL
        ? createAdminNotificationSender(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL, env.ADMIN_NOTIFICATION_EMAIL)
        : undefined,
    });

    return withVisitorCookie(response, visitor.visitorId, url.protocol === 'https:');
  },
  async scheduled(_controller: ScheduledController, env: WorkerEnv): Promise<void> {
    await new D1EngagementRepository(env.DB).cleanupExpiredVerification();
  },
} satisfies ExportedHandler<WorkerEnv>;
