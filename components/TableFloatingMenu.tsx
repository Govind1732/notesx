"use client";

import { Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import {
  Rows,
  Columns,
  Trash2,
  PlusSquare,
  MinusSquare,
  Heading,
  Table as TableIcon,
} from "lucide-react";
import { useCallback } from "react";

interface TableFloatingMenuProps {
  editor: Editor;
}

function MenuButton({
  onClick,
  title,
  children,
  danger = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
        danger
          ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-700 dark:hover:text-stone-200"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />;
}

export default function TableFloatingMenu({ editor }: TableFloatingMenuProps) {
  const shouldShow = useCallback(() => {
    return editor.isActive("table");
  }, [editor]);

  if (!editor) return null;

  return (
    <FloatingMenu
      editor={editor}
      shouldShow={shouldShow}
      options={{ placement: "top-start" }}
    >
      <div className="flex items-center gap-0.5 px-2 py-1.5 border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md rounded-xl shadow-xl z-50">
        <div className="flex items-center gap-0.5 px-1 mr-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          Table
        </div>
        
        <Divider />

        {/* Column Actions */}
        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Add Column Before"
          >
            <PlusSquare className="w-3.5 h-3.5" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column After"
          >
            <Columns className="w-3.5 h-3.5" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Delete Column"
            danger
          >
            <MinusSquare className="w-3.5 h-3.5" />
          </MenuButton>
        </div>

        <Divider />

        {/* Row Actions */}
        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="Add Row Above"
          >
            <PlusSquare className="w-3.5 h-3.5 rotate-90" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row Below"
          >
            <Rows className="w-3.5 h-3.5" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Delete Row"
            danger
          >
            <MinusSquare className="w-3.5 h-3.5 rotate-90" />
          </MenuButton>
        </div>

        <Divider />

        {/* Table Wide Actions */}
        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            title="Toggle Header Row"
          >
            <Heading className="w-3.5 h-3.5" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete Table"
            danger
          >
            <Trash2 className="w-3.5 h-3.5" />
          </MenuButton>
        </div>
      </div>
    </FloatingMenu>
  );
}
