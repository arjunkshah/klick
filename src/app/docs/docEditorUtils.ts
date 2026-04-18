/** Markdown helpers for the docs textarea (selection-aware). */

export function wrapSelection(
  text: string,
  start: number,
  end: number,
  before: string,
  after: string,
): { text: string; selStart: number; selEnd: number } {
  const selected = text.slice(start, end);
  if (start === end) {
    const next = text.slice(0, start) + before + after + text.slice(end);
    const pos = start + before.length;
    return { text: next, selStart: pos, selEnd: pos };
  }
  const next = text.slice(0, start) + before + selected + after + text.slice(end);
  return {
    text: next,
    selStart: start + before.length,
    selEnd: start + before.length + selected.length,
  };
}

export function toggleLinePrefix(text: string, cursor: number, prefix: string): { text: string; cursor: number } {
  const lines = text.split("\n");
  let pos = 0;
  let lineIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const len = lines[i]!.length + 1;
    if (pos + len > cursor || i === lines.length - 1) {
      lineIndex = i;
      break;
    }
    pos += len;
  }
  const line = lines[lineIndex]!;
  const trimmed = line.trimStart();
  const indent = line.slice(0, line.length - trimmed.length);
  let newLine: string;
  if (trimmed.startsWith(prefix)) {
    newLine = indent + trimmed.slice(prefix.length);
  } else {
    newLine = indent + prefix + trimmed;
  }
  lines[lineIndex] = newLine;
  const next = lines.join("\n");
  const delta = newLine.length - line.length;
  return { text: next, cursor: Math.max(0, cursor + delta) };
}

export type TriggerMenu =
  | { kind: "slash"; start: number; query: string }
  | { kind: "at"; start: number; query: string };

/** Token is `/cmd` or `@q` immediately before cursor (after whitespace or start). */
export function getTriggerMenu(text: string, cursor: number): TriggerMenu | null {
  if (cursor <= 0) return null;
  let j = cursor - 1;
  while (j >= 0 && !/[\s\n]/.test(text[j]!)) {
    j--;
  }
  const tokenStart = j + 1;
  const token = text.slice(tokenStart, cursor);
  if (token.startsWith("/") && !token.slice(1).includes("/") && token.length >= 1) {
    return { kind: "slash", start: tokenStart, query: token.slice(1).toLowerCase() };
  }
  if (token.startsWith("@") && !token.slice(1).includes("@") && token.length >= 1) {
    return { kind: "at", start: tokenStart, query: token.slice(1).toLowerCase() };
  }
  return null;
}

export type SlashCommand = {
  id: string;
  label: string;
  hint: string;
  keywords?: string[];
  /** Inserted in place of the `/…` token (token includes `/`). */
  insert: string;
  /** Move caret to this offset from start of inserted text (default: end of insert). */
  cursorOffset?: number;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: "h1", label: "Heading 1", hint: "# Title", keywords: ["h1", "title"], insert: "# " },
  { id: "h2", label: "Heading 2", hint: "## Title", keywords: ["h2", "subtitle"], insert: "## " },
  { id: "h3", label: "Heading 3", hint: "### Title", keywords: ["h3"], insert: "### " },
  {
    id: "bullet",
    label: "Bulleted list",
    hint: "- item",
    keywords: ["list", "ul"],
    insert: "- ",
  },
  {
    id: "ordered",
    label: "Numbered list",
    hint: "1. item",
    keywords: ["ol", "number"],
    insert: "1. ",
  },
  {
    id: "task",
    label: "Task list",
    hint: "- [ ] Todo",
    keywords: ["todo", "checkbox"],
    insert: "- [ ] ",
  },
  { id: "quote", label: "Quote", hint: "> Citation", keywords: ["blockquote"], insert: "> " },
  {
    id: "divider",
    label: "Divider",
    hint: "---",
    keywords: ["hr", "line", "separator"],
    insert: "\n---\n",
  },
  {
    id: "code",
    label: "Code block",
    hint: "``` code ```",
    keywords: ["snippet"],
    insert: "```\n\n```",
    cursorOffset: 4,
  },
  {
    id: "table",
    label: "Table",
    hint: "Markdown table",
    keywords: ["grid"],
    insert: "| Col | Col |\n| --- | --- |\n|     |     |\n",
    cursorOffset: 2,
  },
];

export function filterSlashCommands(q: string): SlashCommand[] {
  const s = q.trim();
  if (!s) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter(
    (c) =>
      c.id.includes(s) ||
      c.label.toLowerCase().includes(s) ||
      c.keywords?.some((k) => k.includes(s) || s.includes(k)),
  );
}

export function applyTriggerReplacement(
  text: string,
  triggerStart: number,
  cursor: number,
  replacement: string,
  cursorOffset?: number,
): { text: string; selStart: number; selEnd: number } {
  const next = text.slice(0, triggerStart) + replacement + text.slice(cursor);
  const base = triggerStart + replacement.length;
  if (cursorOffset !== undefined) {
    const pos = triggerStart + cursorOffset;
    return { text: next, selStart: pos, selEnd: pos };
  }
  return { text: next, selStart: base, selEnd: base };
}
