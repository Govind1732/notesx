"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useCallback, useEffect, useRef, useState } from "react";
import BubbleToolbar from "./BubbleToolbar";
import { defaultSlashItems, filterSlashItems, type SlashCommandItem } from "@/lib/slashCommands";

interface TiptapEditorProps {
  content: any;
  onUpdate: (json: any) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export default function TiptapEditor({
  content,
  onUpdate,
  onImageUpload,
}: TiptapEditorProps) {
  const isUpdatingRef = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const onImageUploadRef = useRef(onImageUpload);

  // Slash menu state
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashRange, setSlashRange] = useState<{ from: number; to: number } | null>(null);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [slashIndex, setSlashIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onImageUploadRef.current = onImageUpload; }, [onImageUpload]);

  // Listen for slash-command image insert events
  useEffect(() => {
    const handler = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/gif,image/webp";
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files) return;
        for (const file of Array.from(input.files)) {
          try {
            const url = await onImageUploadRef.current(file);
            editor?.chain().focus().setImage({ src: url }).run();
          } catch (err) {
            console.error("Image upload failed:", err);
          }
        }
      };
      input.click();
    };

    document.addEventListener("notesx:insert-image", handler);
    return () => document.removeEventListener("notesx:insert-image", handler);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        heading: { levels: [1, 2, 3] },
      }),
      HorizontalRule,
      Image.configure({
        HTMLAttributes: { class: "tiptap-image" },
        allowBase64: false,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return "Type '/' for commands...";
        },
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
    ],
    content: content || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editorProps: {
      attributes: {
        class: "tiptap-content",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files.length > 0
        ) {
          const files = Array.from(event.dataTransfer.files);
          const imageFiles = files.filter((f) => f.type.startsWith("image/"));

          if (imageFiles.length > 0) {
            event.preventDefault();
            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            imageFiles.forEach(async (file) => {
              try {
                const url = await onImageUploadRef.current(file);
                if (coords && editor) {
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(coords.pos, {
                      type: "image",
                      attrs: { src: url },
                    })
                    .run();
                }
              } catch (err) {
                console.error("Drop upload failed:", err);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        if (event.clipboardData && event.clipboardData.files.length > 0) {
          const files = Array.from(event.clipboardData.files);
          const imageFiles = files.filter((f) => f.type.startsWith("image/"));

          if (imageFiles.length > 0) {
            event.preventDefault();
            imageFiles.forEach(async (file) => {
              try {
                const url = await onImageUploadRef.current(file);
                editor?.chain().focus().setImage({ src: url }).run();
              } catch (err) {
                console.error("Paste upload failed:", err);
              }
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!isUpdatingRef.current) {
        onUpdateRef.current(ed.getJSON());
      }

      // Check for slash command
      checkSlashCommand(ed);
    },
    immediatelyRender: false,
  });

  // Check if we're in a slash command context
  const checkSlashCommand = useCallback((ed: any) => {
    const { $from } = ed.state.selection;
    const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

    if (textBefore.startsWith("/")) {
      const query = textBefore.slice(1);
      const range = {
        from: $from.pos - textBefore.length,
        to: $from.pos,
      };

      // Get coordinates for menu positioning
      const coords = ed.view.coordsAtPos(range.from);

      setSlashQuery(query);
      setSlashRange(range);
      setSlashPos({ top: coords.bottom + 4, left: coords.left });
      setSlashOpen(true);
      setSlashIndex(0);
    } else {
      setSlashOpen(false);
    }
  }, []);

  // Handle keyboard events for slash menu
  useEffect(() => {
    if (!slashOpen || !editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = filterSlashItems(slashQuery, defaultSlashItems);
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (slashRange) {
          items[slashIndex].command({ editor, range: slashRange });
          setSlashOpen(false);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSlashOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [slashOpen, slashQuery, slashIndex, slashRange, editor]);

  // Sync external content changes (e.g. switching notes)
  useEffect(() => {
    if (editor && content) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const incomingJSON = JSON.stringify(content);
      if (currentJSON !== incomingJSON) {
        isUpdatingRef.current = true;
        editor.commands.setContent(content);
        isUpdatingRef.current = false;
      }
    }
  }, [content, editor]);

  const filteredSlashItems = filterSlashItems(slashQuery, defaultSlashItems);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex gap-2 items-center text-stone-400">
          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {/* Floating bubble toolbar on text selection */}
      <BubbleToolbar editor={editor} />

      {/* Editor area */}
      <div className="max-w-[720px] mx-auto w-full px-6 py-2 md:px-8">
        <EditorContent editor={editor} />
      </div>

      {/* Slash command menu */}
      {slashOpen && filteredSlashItems.length > 0 && (
        <div
          ref={slashMenuRef}
          className="slash-menu"
          style={{
            position: "fixed",
            top: `${slashPos.top}px`,
            left: `${slashPos.left}px`,
            zIndex: 50,
          }}
        >
          {filteredSlashItems.map((item, index) => (
            <button
              key={item.title}
              onMouseDown={(e) => {
                e.preventDefault();
                if (slashRange) {
                  item.command({ editor, range: slashRange });
                  setSlashOpen(false);
                }
              }}
              onMouseEnter={() => setSlashIndex(index)}
              className={`slash-menu-item ${index === slashIndex ? "is-selected" : ""}`}
            >
              <span className="slash-menu-icon">{item.icon}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {item.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
