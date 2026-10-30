export interface Project {
  id: string;
  name: string;
  kind: string;
  started: string;
  line: string;
  lineZh: string;
  problem: string;
  problemZh: string;
  does: string[];
  doesZh: string[];
  stack: string;
  stackZh: string;
  status: string;
  statusZh: string;
  href: string;
}

// 托盘照片上前两格放作品，其余四格留空
export const projects: Project[] = [
  {
    id: 'md2docx',
    name: 'md2docx-historypaper-skill',
    kind: 'Agent skill',
    started: '2026-10',
    line: 'Turns a history paper written in Markdown into a journal-ready Word file, footnotes and citations in place.',
    lineZh: '把用 Markdown 写的历史论文转成可以直接投稿的 Word 文件，脚注和引文都会放在该放的位置。',
    problem: 'The first time an agent formatted one of my papers for a history journal, it took about two and a half hours and twelve wrong turns in Word’s XML.',
    problemZh: '我第一次让 Agent 按史学期刊的格式排自己的论文，花了大约两个半小时，在 Word 的 XML 里走错了十二次。',
    does: [
      'Builds the .docx in the house style of Historical Research: headings, abstract, body and fonts set the way the journal asks.',
      'Numbers footnotes ①② and restarts them on every page, then normalises citation style.',
      'Fills in missing page numbers from a local Zotero library when it is running, and lists what is still missing.',
    ],
    doesZh: [
      '按《历史研究》的体例生成 .docx，标题、摘要、正文和字体都按期刊的要求设置。',
      '脚注用 ①② 编号，每一页重新计数，并统一引文格式。',
      '本地开着 Zotero 时，会从文献库里补上缺的页码，补不上的会列出来。',
    ],
    stack: 'Python 3.10+, standard library only',
    stackZh: 'Python 3.10+，只用标准库。',
    status: 'Working, used on my own papers',
    statusZh: '可以用，我自己的论文就是用它排的。',
    href: 'https://github.com/Haoo-7/md2docx-historypaper-skill',
  },
  {
    id: 'agent-recap',
    name: 'agent-recap',
    kind: 'Agent workflow',
    started: '2026-10',
    line: 'One way for every AI agent to sign off: what this round did, and what comes next.',
    lineZh: '让每个 AI Agent 都用同一种方式收尾，说清这一轮做了什么、下一步做什么。',
    problem: 'I run several coding agents on one machine, and each one ends a long reply differently. After a long session I couldn’t tell what had happened or what was next.',
    problemZh: '我在一台电脑上同时用好几个写代码的 Agent，它们结束长回复的方式各不相同。一场长会话下来，我常常说不清刚才发生了什么、接下来该做什么。',
    does: [
      'Adds the same closing two lines to every agent: a recap of this round, and the next step.',
      'Finds the agents installed on the machine and writes the rule where each one reads it, from CLAUDE.md to Cursor rules.',
      'Re-running updates in place; one command removes it everywhere.',
    ],
    doesZh: [
      '给每个 Agent 加上同样的两行收尾：一行总结这一轮，一行写下一步。',
      '找出电脑上装了哪些 Agent，把规则写进它们各自会读的文件，从 CLAUDE.md 到 Cursor rules 都有。',
      '再运行一次会在原处更新；用一条命令就能把它从所有地方删掉。',
    ],
    stack: 'JavaScript (Node), no dependencies',
    stackZh: 'JavaScript（Node），没有依赖。',
    status: 'Working, 30+ agents supported',
    statusZh: '可以用，已经支持 30 多种 Agent。',
    href: 'https://github.com/Haoo-7/agent-recap',
  },
];
