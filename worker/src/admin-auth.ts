export interface AdminAuthConfig {
  environment: 'development' | 'production';
  localToken?: string;
  teamDomain?: string;
  audience?: string;
  fetcher?: typeof fetch;
}

export interface AdminAuthResult {
  authenticated: boolean;
  subject?: string;
  email?: string;
}

interface AccessClaims {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
  exp?: number;
  nbf?: number;
}

interface AccessHeader {
  alg?: string;
  kid?: string;
}

function readBearerToken(request: Request): string | undefined {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7).trim();
  return request.headers.get('Cf-Access-Jwt-Assertion') ?? undefined;
}

function decodeJson<T>(value: string): T | null {
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0)))) as T;
  } catch {
    return null;
  }
}

function decodeBytes(value: string): Uint8Array | null {
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function expectedIssuer(teamDomain: string): string {
  return teamDomain.startsWith('http') ? teamDomain.replace(/\/$/, '') : `https://${teamDomain}`;
}

export async function authenticateAdmin(request: Request, config: AdminAuthConfig): Promise<AdminAuthResult> {
  const token = readBearerToken(request);
  if (!token) return { authenticated: false };

  if (config.environment === 'development' && config.localToken && token === config.localToken) {
    return { authenticated: true, subject: 'local-admin' };
  }
  if (!config.teamDomain || !config.audience) return { authenticated: false };

  const parts = token.split('.');
  if (parts.length !== 3) return { authenticated: false };
  const header = decodeJson<AccessHeader>(parts[0]);
  const claims = decodeJson<AccessClaims>(parts[1]);
  const signature = decodeBytes(parts[2]);
  if (!header || !claims || !signature || header.alg !== 'RS256' || !header.kid) {
    return { authenticated: false };
  }

  const now = Math.floor(Date.now() / 1000);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (
    claims.iss !== expectedIssuer(config.teamDomain)
    || !audience.includes(config.audience)
    || (claims.exp !== undefined && claims.exp <= now)
    || (claims.nbf !== undefined && claims.nbf > now)
  ) {
    return { authenticated: false };
  }

  try {
    const fetcher = config.fetcher ?? fetch;
    const response = await fetcher(`${expectedIssuer(config.teamDomain)}/cdn-cgi/access/certs`);
    if (!response.ok) return { authenticated: false };
    const body = await response.json() as { keys?: JsonWebKey[] };
    const jwk = body.keys?.find((key) => (key as JsonWebKey & { kid?: string }).kid === header.kid);
    if (!jwk) return { authenticated: false };
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signature,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return valid
      ? { authenticated: true, subject: claims.sub, email: claims.email }
      : { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}
