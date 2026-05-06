"use client";

import { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
} from "lucide-react";

interface BubbleToolbarProps {
  editor: Editor;
}

function BubbleButton({
  onClick,
  isActive = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent selection loss
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-100 cursor-pointer ${
        isActive
          ? "bg-white/20 text-white"
          : "text-stone-300 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export default function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const { from, to, empty } = editor.state.selection;

    if (empty || from === to) {
      setIsVisible(false);
      return;
    }

    // Don't show on node selections (images etc)
    if (editor.state.selection instanceof NodeSelection) {
      setIsVisible(false);
      return;
    }

    const view = editor.view;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // Position above the selection
    const left = (start.left + end.left) / 2;
    const top = start.top - 10;

    setPosition({ top, left });
    setIsVisible(true);
  }, [editor]);

  useEffect(() => {
    const onSelectionUpdate = () => {
      // Small delay to let the selection settle
      requestAnimationFrame(updatePosition);
    };

    editor.on("selectionUpdate", onSelectionUpdate);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", onSelectionUpdate);
      editor.off("blur", () => setIsVisible(false));
    };
  }, [editor, updatePosition]);

  if (!isVisible) return null;

  // Adjust position accounting for toolbar width
  const toolbarWidth = toolbarRef.current?.offsetWidth || 280;
  const toolbarHeight = toolbarRef.current?.offsetHeight || 36;
  const adjustedLeft = Math.max(8, position.left - toolbarWidth / 2);
  const adjustedTop = position.top - toolbarHeight - 4;

  return (
    <div
      ref={toolbarRef}
      className="bubble-toolbar"
      style={{
        position: "fixed",
        top: `${adjustedTop}px`,
        left: `${adjustedLeft}px`,
        zIndex: 50,
      }}
    >
      <BubbleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Code"
      >
        <Code className="w-3.5 h-3.5" />
      </BubbleButton>

      <div className="w-px h-4 bg-stone-600 mx-0.5" />

      <BubbleButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </BubbleButton>
    </div>
  );
}
