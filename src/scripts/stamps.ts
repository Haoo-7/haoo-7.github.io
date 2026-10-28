import { $, $$, reduce } from './core';

// 邮票版：链接票盖戳后照常打开，邮箱票盖戳并复制，公众号票翻面
const sheet = $<HTMLElement>('.stamp-sheet');
const msg = $<HTMLElement>('[data-msg]');

if (sheet && msg) {
  const idle = '';
  let t = 0;

  const say = (text: string) => {
    msg.textContent = text;
    clearTimeout(t);
    t = window.setTimeout(() => (msg.textContent = idle), 2400);
  };

  // 盖一枚邮戳，版张跟着轻轻一沉；减少动态时只留戳
  const frank = (stamp: Element) => {
    stamp.classList.add('used');
    if (reduce) return;
    sheet.classList.remove('thud');
    void sheet.offsetWidth;
    sheet.classList.add('thud');
  };

  $$('.stamp').forEach((stamp) => {
    stamp.addEventListener('click', async () => {
      const mail = (stamp as HTMLElement).dataset.mail;
      if (mail) {
        frank(stamp);
        try {
          await navigator.clipboard.writeText(mail);
          say(`Copied · ${mail}`);
        } catch {
          say(`Couldn’t copy · ${mail}`);
        }
        return;
      }

      if ((stamp as HTMLElement).dataset.flip !== undefined) {
        const on = !stamp.classList.contains('stamp-flipped');
        stamp.classList.toggle('stamp-flipped', on);
        stamp.setAttribute('aria-pressed', String(on));
        stamp.setAttribute('aria-label', on ? 'WeChat official account, hide QR code' : 'WeChat official account, show QR code');
        if (on) {
          say('Scan with WeChat');
        } else {
          clearTimeout(t);
          msg.textContent = idle;
        }
        return;
      }

      // 链接票不加 preventDefault，用真实的 <a target="_blank"> 打开
      if (stamp instanceof HTMLAnchorElement) {
        frank(stamp);
        say(`Opening ${stamp.href.replace(/^https:\/\//, '')}`);
      }
    });
  });

  // Esc 把翻开的票翻回去
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const flipped = $$('.stamp-flipped');
    if (!flipped.length) return;
    flipped.forEach((stamp) => {
      stamp.classList.remove('stamp-flipped');
      stamp.setAttribute('aria-pressed', 'false');
      stamp.setAttribute('aria-label', 'WeChat official account, show QR code');
    });
    clearTimeout(t);
    msg.textContent = idle;
  });
}
