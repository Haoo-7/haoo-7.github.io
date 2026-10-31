import { zh } from '../i18n/copy-zh';

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
  doesZh: readonly string[];
  stack: string;
  stackZh: string;
  status: string;
  statusZh: string;
  href: string;
}

// 托盘照片上按顺序每格放一个作品，剩下的格子留空
export const projects: Project[] = [
  {
    id: 'dayline',
    name: 'Dayline Journal',
    kind: 'Obsidian plugin',
    started: '2026-07',
    line: 'A visual journal for Obsidian: calendar, timeline, mood, memories, weather and photos in one place.',
    lineZh: zh.projects['dayline'].line,
    problem: 'At university I switched to Day One and gave up after five months. My journal lived on its servers, where AI couldn’t read it. When I moved it into Obsidian, I found it was a bare shell for keeping a journal: no photo calendar, no On This Day, no timeline.',
    problemZh: zh.projects['dayline'].why,
    does: [
      'Photo calendar: a whole month covered in my photos. An empty day nags at you, so you want to fill it in.',
      'Timeline: the journal stops being a folder of cold, dated files.',
      'Mood: a colour for each day, shown on the calendar too.',
      'Weather and photo EXIF: how wild the weather was that day, and when, on what and with which settings each photo was taken.',
    ],
    doesZh: zh.projects['dayline'].does,
    stack: 'TypeScript, on Obsidian desktop and mobile',
    stackZh: zh.projects['dayline'].builtWith,
    status: 'In the official Obsidian community plugin store. Search for Dayline Journal.',
    statusZh: zh.projects['dayline'].status,
    href: 'https://github.com/Haoo-7/Obsidian-Dayline',
  },
  {
    id: 'md2docx',
    name: 'md2docx-historypaper-skill',
    kind: 'Agent skill',
    started: '2026-10',
    line: 'Turns a history paper written in Markdown into a journal-ready Word file, footnotes and citations in place.',
    lineZh: zh.projects['md2docx'].line,
    problem: 'The first time an agent formatted one of my papers for a history journal, it took about two and a half hours and twelve wrong turns in Word’s XML.',
    problemZh: zh.projects['md2docx'].why,
    does: [
      'Builds the .docx in the house style of Historical Research: headings, abstract, body and fonts set the way the journal asks.',
      'Numbers footnotes ①② and restarts them on every page, then normalises citation style.',
      'Fills in missing page numbers from a local Zotero library when it is running, and lists what is still missing.',
    ],
    doesZh: zh.projects['md2docx'].does,
    stack: 'Python 3.10+, standard library only',
    stackZh: zh.projects['md2docx'].builtWith,
    status: 'Working, used on my own papers',
    statusZh: zh.projects['md2docx'].status,
    href: 'https://github.com/Haoo-7/md2docx-historypaper-skill',
  },
  {
    id: 'agent-recap',
    name: 'agent-recap',
    kind: 'Agent workflow',
    started: '2026-10',
    line: 'One way for every AI agent to sign off: what this round did, and what comes next.',
    lineZh: zh.projects['agent-recap'].line,
    problem: 'I run several coding agents on one machine, and each one ends a long reply differently. After a long session I couldn’t tell what had happened or what was next.',
    problemZh: zh.projects['agent-recap'].why,
    does: [
      'Adds the same closing two lines to every agent: a recap of this round, and the next step.',
      'Finds the agents installed on the machine and writes the rule where each one reads it, from CLAUDE.md to Cursor rules.',
      'Re-running updates in place; one command removes it everywhere.',
    ],
    doesZh: zh.projects['agent-recap'].does,
    stack: 'JavaScript (Node), no dependencies',
    stackZh: zh.projects['agent-recap'].builtWith,
    status: 'Working, 30+ agents supported',
    statusZh: zh.projects['agent-recap'].status,
    href: 'https://github.com/Haoo-7/agent-recap',
  },
];

// 托盘共六格，空格子的编号，如 04–06
const pad = (n: number) => String(n).padStart(2, '0');
export const laterCells = projects.length < 5 ? `${pad(projects.length + 1)}–06` : '06';
