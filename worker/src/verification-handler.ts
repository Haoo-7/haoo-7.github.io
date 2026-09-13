import { hmacSha256, normalizeEmail, sha256 } from './verification';

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export interface EmailCodeRecord {
  emailHmac: string;
  codeDigest: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

export interface EmailSessionRecord {
  emailHmac: string;
  expiresAt: number;
}

export interface EmailVerificationRepository {
  getCode(emailHmac: string): Promise<EmailCodeRecord | null>;
  saveCode(input: EmailCodeRecord): Promise<void>;
  incrementAttempts(emailHmac: string): Promise<number>;
  consumeCode(emailHmac: string): Promise<void>;
  createSession(input: { tokenDigest: string; emailHmac: string; expiresAt: number }): Promise<void>;
  getSession(tokenDigest: string): Promise<EmailSessionRecord | null>;
}

export interface VerificationEmail {
  email: string;
  code: string;
}

export interface EmailVerificationOptions {
  secret: string;
  sendEmail: (input: VerificationEmail) => Promise<void>;
  exposeCode?: boolean;
  now?: () => number;
  randomCode?: () => string;
  randomToken?: () => string;
}

export type EmailVerificationResult =
  | { success: true; data: { expiresAt: number; devCode?: string } }
  | { success: false; error: { code: 'RATE_LIMITED' | 'EMAIL_UNAVAILABLE' | 'CODE_INVALID'; message: string; recoverable: boolean } };

export type EmailVerifyResult =
  | { success: true; data: { sessionToken: string; expiresAt: number } }
  | { success: false; error: { code: 'CODE_INVALID' | 'DATABASE_ERROR'; message: string; recoverable: boolean } };

function defaultRandomCode(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, '0');
}

function defaultRandomToken(): string {
  return `${crypto.randomUUID()}-${crypto.randomUUID()}`;
}

export class EmailVerificationHandler {
  private readonly now: () => number;
  private readonly randomCode: () => string;
  private readonly randomToken: () => string;

  constructor(
    private readonly repository: EmailVerificationRepository,
    private readonly options: EmailVerificationOptions,
  ) {
    this.now = options.now ?? Date.now;
    this.randomCode = options.randomCode ?? defaultRandomCode;
    this.randomToken = options.randomToken ?? defaultRandomToken;
  }

  async requestCode(rawEmail: string): Promise<EmailVerificationResult> {
    const email = normalizeEmail(rawEmail);
    const emailHmac = await hmacSha256(this.options.secret, email);
    const now = this.now();
    const existing = await this.repository.getCode(emailHmac);
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: '验证码发送过于频繁，请稍后再试。',
          recoverable: true,
        },
      };
    }

    const code = this.randomCode();
    try {
      await this.options.sendEmail({ email, code });
      await this.repository.saveCode({
        emailHmac,
        codeDigest: await sha256(code),
        expiresAt: now + CODE_TTL_MS,
        lastSentAt: now,
        attempts: 0,
      });
      return {
        success: true,
        data: {
          expiresAt: now + CODE_TTL_MS,
          ...(this.options.exposeCode ? { devCode: code } : {}),
        },
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'EMAIL_UNAVAILABLE',
          message: '验证码暂时无法发送，请稍后再试。',
          recoverable: true,
        },
      };
    }
  }

  async verifyCode(rawEmail: string, code: string): Promise<EmailVerifyResult> {
    const email = normalizeEmail(rawEmail);
    const emailHmac = await hmacSha256(this.options.secret, email);
    const record = await this.repository.getCode(emailHmac);
    const now = this.now();
    if (!record || record.expiresAt <= now || record.attempts >= MAX_ATTEMPTS) {
      return this.invalidCodeResult();
    }

    const digest = await sha256(code);
    if (!constantTimeEqual(digest, record.codeDigest)) {
      const attempts = await this.repository.incrementAttempts(emailHmac);
      return attempts >= MAX_ATTEMPTS ? this.invalidCodeResult() : this.invalidCodeResult();
    }

    await this.repository.consumeCode(emailHmac);
    const sessionToken = this.randomToken();
    const expiresAt = now + SESSION_TTL_MS;
    await this.repository.createSession({
      tokenDigest: await sha256(sessionToken),
      emailHmac,
      expiresAt,
    });
    return { success: true, data: { sessionToken, expiresAt } };
  }

  async getSession(token: string): Promise<EmailSessionRecord | null> {
    return this.repository.getSession(await sha256(token));
  }

  private invalidCodeResult(): EmailVerifyResult {
    return {
      success: false,
      error: {
        code: 'CODE_INVALID',
        message: '验证码无效或已过期，请重新获取。',
        recoverable: true,
      },
    };
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export const verificationLimits = {
  codeTtlMs: CODE_TTL_MS,
  resendCooldownMs: RESEND_COOLDOWN_MS,
  maxAttempts: MAX_ATTEMPTS,
  sessionTtlMs: SESSION_TTL_MS,
};
