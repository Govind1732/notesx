"use client";

import { Editor } from "@tiptap/react";
import { useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  ImagePlus,
  Undo2,
  Redo2,
  Link,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
  onImageInsert: () => void;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
        isActive
          ? "bg-stone-200 dark:bg-white/10 text-stone-900 dark:text-stone-100 shadow-sm"
          : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-700 dark:hover:text-stone-200"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />;
}

export default function EditorToolbar({
  editor,
  onImageInsert,
}: EditorToolbarProps) {
  // Use local state to force re-render when editor state changes
  const [, setUpdateCount] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const onUpdate = () => {
      setUpdateCount((c) => c + 1);
    };

    editor.on("transaction", onUpdate);
    return () => {
      editor.off("transaction", onUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-black/[0.05] dark:border-white/[0.05] bg-white/80 dark:bg-[#0C0C0C]/80 backdrop-blur-md overflow-x-auto no-scrollbar shrink-0 z-20">
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Cmd+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Cmd+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          title="Task List"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onImageInsert} title="Insert Image">
          <ImagePlus className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>
    </div>
  );
}
