import { describe, expect, it } from 'vitest';
import { handleApiRequest, type ApiRepository } from './index';
import type { EmailCodeRecord, EmailSessionRecord, EmailVerificationRepository } from './verification-handler';

describe('handleApiRequest', () => {
  it('验证状态接口不返回邮箱信息', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 0, likes: 0, liked: false, comments: [] }),
      recordView: async () => ({ views: 0, counted: false }),
      toggleLike: async () => ({ likes: 0, liked: false }),
      consumeAllowance: async () => true,
      createComment: async () => ({
        id: 1,
        displayName: 'Reader',
        content: '测试',
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
    };
    const verificationRepository: EmailVerificationRepository = {
      getCode: async () => null,
      saveCode: async () => undefined,
      incrementAttempts: async () => 0,
      consumeCode: async () => undefined,
      createSession: async () => undefined,
      getSession: async () => null,
    };

    const response = await handleApiRequest(
      new Request('http://localhost/api/comments/verification/status'),
      {
        repository,
        verificationRepository,
        emailHmacSecret: 'test-secret',
        visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
        environment: 'development',
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: { verified: false } });
  });

  it('本地验证码验证后通过 HttpOnly 会话提交评论', async () => {
    let code: EmailCodeRecord | null = null;
    const sessions = new Map<string, EmailSessionRecord>();
    const repository: ApiRepository & EmailVerificationRepository = {
      getEngagement: async () => ({ views: 0, likes: 0, liked: false, comments: [] }),
      recordView: async () => ({ views: 0, counted: false }),
      toggleLike: async () => ({ likes: 0, liked: false }),
      consumeAllowance: async () => true,
      createComment: async (input) => ({
        id: 10,
        displayName: input.displayName,
        content: input.content,
        website: null,
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
      getCode: async () => code,
      saveCode: async (input) => { code = input; },
      incrementAttempts: async () => {
        if (code) code = { ...code, attempts: code.attempts + 1 };
        return code?.attempts ?? 5;
      },
      consumeCode: async () => { code = null; },
      createSession: async (input) => { sessions.set(input.tokenDigest, { emailHmac: input.emailHmac, expiresAt: input.expiresAt }); },
      getSession: async (tokenDigest) => sessions.get(tokenDigest) ?? null,
    };
    const context = {
      repository,
      verificationRepository: repository,
      emailHmacSecret: 'local-test-secret',
      visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
      environment: 'development' as const,
    };

    const requested = await handleApiRequest(
      new Request('http://localhost/api/comments/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ' Reader@Example.com ' }),
      }),
      context,
    );
    const requestedBody = await requested.json() as { data: { devCode?: string } };
    expect(requestedBody.data.devCode).toMatch(/^\d{6}$/);

    const verified = await handleApiRequest(
      new Request('http://localhost/api/comments/verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'reader@example.com', code: requestedBody.data.devCode }),
      }),
      context,
    );
    expect(verified.status).toBe(200);
    const cookie = verified.headers.get('Set-Cookie')?.split(';', 1)[0];
    expect(cookie).toMatch(/^haoo_comment_session=/);

    const comment = await handleApiRequest(
      new Request('http://localhost/api/posts/ai-assisted-learning/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie ?? '',
        },
        body: JSON.stringify({ displayName: 'Haoo', content: '**已验证评论**' }),
      }),
      context,
    );
    expect(comment.status).toBe(201);
  });

  it('本地管理员令牌可以读取和审核待审评论', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 0, likes: 0, liked: false, comments: [] }),
      recordView: async () => ({ views: 0, counted: false }),
      toggleLike: async () => ({ likes: 0, liked: false }),
      consumeAllowance: async () => true,
      createComment: async () => ({
        id: 1,
        displayName: 'Reader',
        content: '待审',
        website: null,
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
    };
    const adminRepository = {
      listComments: async () => ({ comments: [], nextCursor: null }),
      updateCommentStatus: async () => null,
      deleteComment: async () => false,
      recordAudit: async () => undefined,
    };

    const unauthorized = await handleApiRequest(
      new Request('http://localhost/api/admin/comments'),
      { repository, adminRepository, visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177', environment: 'development', localAdminToken: 'secret' },
    );
    expect(unauthorized.status).toBe(401);

    const authorized = await handleApiRequest(
      new Request('http://localhost/api/admin/comments', { headers: { Authorization: 'Bearer secret' } }),
      { repository, adminRepository, visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177', environment: 'development', localAdminToken: 'secret' },
    );
    expect(authorized.status).toBe(200);
    expect(await authorized.json()).toEqual({ success: true, data: { comments: [], nextCursor: null } });
  });

  it('读取文章互动数据', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 4, likes: 2, liked: true, comments: [] }),
      recordView: async () => ({ views: 4, counted: false }),
      toggleLike: async () => ({ likes: 2, liked: true }),
      consumeAllowance: async () => true,
      createComment: async () => ({
        id: 1,
        displayName: 'Haoo',
        content: '测试',
        website: null,
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
    };

    const response = await handleApiRequest(
      new Request('https://example.com/api/posts/ai-assisted-learning/engagement'),
      {
        repository,
        visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
        environment: 'development',
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { views: 4, likes: 2, liked: true, comments: [] },
    });
  });

  it('记录文章浏览', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 5, likes: 2, liked: false, comments: [] }),
      recordView: async () => ({ views: 5, counted: true }),
      toggleLike: async () => ({ likes: 2, liked: false }),
      consumeAllowance: async () => true,
      createComment: async () => ({
        id: 1,
        displayName: 'Haoo',
        content: '测试',
        website: null,
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
    };

    const response = await handleApiRequest(
      new Request('https://example.com/api/posts/ai-assisted-learning/view', { method: 'POST' }),
      {
        repository,
        visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
        environment: 'development',
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { views: 5, counted: true },
    });
  });

  it('切换文章点赞', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 5, likes: 3, liked: true, comments: [] }),
      recordView: async () => ({ views: 5, counted: false }),
      toggleLike: async () => ({ likes: 3, liked: true }),
      consumeAllowance: async () => true,
      createComment: async () => ({
        id: 1,
        displayName: 'Haoo',
        content: '测试',
        website: null,
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
    };

    const response = await handleApiRequest(
      new Request('https://example.com/api/posts/ai-assisted-learning/like', { method: 'POST' }),
      {
        repository,
        visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
        environment: 'development',
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { likes: 3, liked: true },
    });
  });

  it('本地开发提交评论后立即显示', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 5, likes: 3, liked: true, comments: [] }),
      recordView: async () => ({ views: 5, counted: false }),
      toggleLike: async () => ({ likes: 3, liked: true }),
      consumeAllowance: async () => true,
      createComment: async (input) => ({
        id: 9,
        displayName: input.displayName,
        content: input.content,
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
    };

    const response = await handleApiRequest(
      new Request('https://example.com/api/posts/ai-assisted-learning/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Haoo', content: '这是一条评论。' }),
      }),
      {
        repository,
        visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
        environment: 'development',
      },
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      success: true,
      data: {
        pending: false,
        comment: { id: 9, displayName: 'Haoo', content: '这是一条评论。' },
      },
    });
  });

  it('生产环境缺少 Turnstile 配置时拒绝评论', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 0, likes: 0, liked: false, comments: [] }),
      recordView: async () => ({ views: 0, counted: false }),
      toggleLike: async () => ({ likes: 0, liked: false }),
      consumeAllowance: async () => true,
      createComment: async () => {
        throw new Error('不应写入评论');
      },
    };

    const response = await handleApiRequest(
      new Request('https://example.com/api/posts/ai-assisted-learning/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Haoo', content: '生产评论' }),
      }),
      {
        repository,
        visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
        environment: 'production',
      },
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: 'TURNSTILE_REQUIRED' },
    });
  });

  it('代理并规范化网易云歌单元数据', async () => {
    const repository: ApiRepository = {
      getEngagement: async () => ({ views: 0, likes: 0, liked: false, comments: [] }),
      recordView: async () => ({ views: 0, counted: false }),
      toggleLike: async () => ({ likes: 0, liked: false }),
      consumeAllowance: async () => true,
      createComment: async () => ({
        id: 1,
        displayName: 'Haoo',
        content: '测试',
        website: null,
        createdAt: '2026-07-17T17:00:00.000Z',
      }),
    };

    const response = await handleApiRequest(
      new Request('https://example.com/api/music/playlist'),
      {
        repository,
        visitorId: '2eec3ad0-0f86-4cbf-b0c2-856a356f2177',
        environment: 'development',
        musicFetcher: async (input) => {
          expect(input).toContain('id=2794581085');
          return new Response(JSON.stringify([{
            id: 99,
            title: '测试歌曲',
            artist: '测试歌手',
            cover: 'https://cdn.example.com/cover.jpg',
            audioUrl: 'https://cdn.example.com/song.mp3',
          }]));
        },
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      playlistId: '2794581085',
      tracks: [{
        id: '99',
        title: '测试歌曲',
        artist: '测试歌手',
        cover: 'https://cdn.example.com/cover.jpg',
        audioUrl: 'https://cdn.example.com/song.mp3',
      }],
    });
  });
});
