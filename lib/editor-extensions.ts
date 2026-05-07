import { StarterKit } from "@tiptap/starter-kit";
import { Node, mergeAttributes } from "@tiptap/core";
import { common, createLowlight } from "lowlight";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Underline } from "@tiptap/extension-underline";
import { ResizableImage } from "./resizable-image";
import { SlashCommand } from "./slash-command";

const lowlight = createLowlight(common);

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      type: { default: "info" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "callout", class: "callout-block" }),
      0,
    ];
  },
});

export const getEditorExtensions = (placeholderText: string = "Type '/' for commands...") => [
  StarterKit.configure({
    horizontalRule: false,
    heading: { levels: [1, 2, 3] },
    codeBlock: false, // Use lowlight instead
  }),
  Callout,
  HorizontalRule,
  SlashCommand,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-500 underline decoration-blue-500/30 underline-offset-4 hover:text-blue-600 transition-colors cursor-pointer",
    },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: "rounded-lg bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 p-4 font-mono text-sm my-4",
    },
  }),
  ResizableImage,
  TaskList,
  TaskItem.configure({ nested: true }),
  Underline,
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return placeholderText;
    },
    emptyEditorClass: "is-editor-empty",
    emptyNodeClass: "is-empty",
  }),
];
