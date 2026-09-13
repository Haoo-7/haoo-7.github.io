import { describe, expect, it } from 'vitest';
import { authenticateAdmin } from './admin-auth';

describe('authenticateAdmin', () => {
  it('accepts the local admin token only in development', async () => {
    const request = new Request('http://localhost/api/admin/comments', {
      headers: { Authorization: 'Bearer local-secret' },
    });

    await expect(authenticateAdmin(request, {
      environment: 'development',
      localToken: 'local-secret',
    })).resolves.toMatchObject({ authenticated: true });

    await expect(authenticateAdmin(request, {
      environment: 'production',
      localToken: 'local-secret',
    })).resolves.toMatchObject({ authenticated: false });
  });
});
