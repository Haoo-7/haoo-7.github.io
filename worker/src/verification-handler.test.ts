import { describe, expect, it, vi } from 'vitest';
import {
  EmailVerificationHandler,
  type EmailCodeRecord,
  type EmailVerificationRepository,
} from './verification-handler';

describe('EmailVerificationHandler', () => {
  it('sends a six digit code and blocks immediate resend', async () => {
    let savedCode: EmailCodeRecord | null = null;
    const repository: EmailVerificationRepository = {
      getCode: vi.fn(async () => savedCode),
      saveCode: vi.fn(async (input) => { savedCode = input; }),
      incrementAttempts: vi.fn(async () => 1),
      consumeCode: vi.fn(async () => undefined),
      createSession: vi.fn(async () => undefined),
      getSession: vi.fn(async () => null),
    };
    const sendEmail = vi.fn(async () => undefined);
    const handler = new EmailVerificationHandler(repository, {
      secret: 'test-secret',
      sendEmail,
      now: () => 1_750_000_000_000,
      randomCode: () => '123456',
    });

    const first = await handler.requestCode(' Reader@Example.com ');
    expect(first.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ code: '123456' }));
    expect(repository.saveCode).toHaveBeenCalledWith(expect.objectContaining({
      codeDigest: expect.any(String),
      expiresAt: 1_750_000_600_000,
    }));

    const stored = await handler.requestCode('reader@example.com');
    expect(stored).toMatchObject({ success: false, error: { code: 'RATE_LIMITED' } });
  });
});
