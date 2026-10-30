import { zh } from '../i18n/copy-zh';

// 首屏三帧与关于页共用：一个人的三个侧面；中文句子在 copy-zh.ts
export const frames = [
  { name: 'Life', fig: 'The reading desk', img: 'life', line: 'What I care about is getting a little better, on purpose.', lineZh: zh.frames[0] },
  { name: 'Tech', fig: 'The workbench', img: 'tech', line: 'People who meet me assume I study engineering. Fair enough: I would rather build the tool than wait for it.', lineZh: zh.frames[1] },
  { name: 'History', fig: 'The archive', img: 'history', line: 'A history undergrad at Jinan University, Guangzhou. I read the past for the big picture and for the people in it.', lineZh: zh.frames[2] },
];
