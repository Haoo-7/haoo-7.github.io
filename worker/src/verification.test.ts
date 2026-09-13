import { describe, expect, it } from 'vitest';
import { hmacSha256, normalizeEmail, renderSafeMarkdown } from './verification';

describe('email verification helpers', () => {
  it('normalizes email addresses before hashing', async () => {
    expect(normalizeEmail('  Reader@Example.COM ')).toBe('reader@example.com');
    expect(await hmacSha256('secret', normalizeEmail('Reader@Example.COM'))).toBe(
      await hmacSha256('secret', 'reader@example.com'),
    );
  });

  it('renders a safe markdown subset without raw HTML or unsafe URLs', () => {
    const result = renderSafeMarkdown('**hello** and [docs](https://example.com)');

    expect(result).toBe('<p><strong>hello</strong> and <a href="https://example.com" rel="nofollow noopener noreferrer" target="_blank">docs</a></p>');
  });
});
