import { zh } from '../i18n/copy-zh';

// 首屏三帧与关于页共用：一个人的三个侧面；中文句子在 copy-zh.ts
export const frames = [
  { name: 'Life', fig: 'The reading desk', img: 'life', line: 'Trying to make my life a little better, bit by bit.', lineZh: zh.frames[0] },
  { name: 'Tech', fig: 'The workbench', img: 'tech', line: 'People who meet me assume I study science or engineering. I just really enjoy tinkering with gadgets and software.', lineZh: zh.frames[1] },
  { name: 'History', fig: 'The archive', img: 'history', line: 'A history undergrad at Jinan University. I try to look at problems, and at life, through history and through people.', lineZh: zh.frames[2] },
];
