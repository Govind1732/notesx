import { Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  searchTerms: string[];
  command: (props: { editor: any; range: { from: number; to: number } }) => void;
}

export const defaultSlashItems: SlashCommandItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "H₁",
    searchTerms: ["heading", "h1", "title", "large"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "H₂",
    searchTerms: ["heading", "h2", "subtitle", "medium"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "H₃",
    searchTerms: ["heading", "h3", "small"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Unordered list",
    icon: "•",
    searchTerms: ["bullet", "list", "unordered", "ul"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    icon: "1.",
    searchTerms: ["numbered", "list", "ordered", "ol"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Checklist",
    description: "Task list with checkboxes",
    icon: "☑",
    searchTerms: ["checklist", "task", "todo", "checkbox"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Image",
    description: "Upload an image",
    icon: "🖼",
    searchTerms: ["image", "photo", "picture", "upload"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // Trigger image upload via custom event
      document.dispatchEvent(new CustomEvent("notesx:insert-image"));
    },
  },
  {
    title: "Divider",
    description: "Horizontal separator",
    icon: "—",
    searchTerms: ["divider", "hr", "separator", "line", "horizontal"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Blockquote",
    description: "Indented quote block",
    icon: "❝",
    searchTerms: ["blockquote", "quote"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Code snippet",
    icon: "<>",
    searchTerms: ["code", "codeblock", "snippet"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Table",
    description: "Insert a 3x3 table",
    icon: "田",
    searchTerms: ["table", "grid", "data"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: "Callout",
    description: "Important information block",
    icon: "💡",
    searchTerms: ["callout", "info", "warning", "important"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("callout").run();
    },
  },
];

export function filterSlashItems(query: string, items: SlashCommandItem[]): SlashCommandItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.searchTerms.some((term) => term.includes(q))
  );
}
