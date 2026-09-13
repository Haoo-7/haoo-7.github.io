const encoder = new TextEncoder();

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function hmacSha256(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(value: string): string {
  let html = escapeHtml(value);
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi, (
    _match,
    label: string,
    url: string,
  ) => `<a href="${url}" rel="nofollow noopener noreferrer" target="_blank">${label}</a>`);
  return html;
}

export function renderSafeMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, '\n').trim().split('\n');
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push(`<p>${renderInlineMarkdown(paragraph.join('\n')).replaceAll('\n', '<br>')}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  for (const line of lines) {
    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }
    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks.join('');
}
