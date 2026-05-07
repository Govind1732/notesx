"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, memo } from "react";
import { getEditorExtensions } from "@/lib/editor-extensions";
import TableFloatingMenu from "./TableFloatingMenu";

interface TiptapEditorProps {
  content: any;
  onCreate: (editor: Editor) => void;
  onUpdate: () => void;
  onImageUpload: (file: File) => Promise<string>;
}

const TiptapEditor = memo(function TiptapEditor({
  content,
  onCreate,
  onUpdate,
  onImageUpload,
}: TiptapEditorProps) {
  const onUpdateRef = useRef(onUpdate);
  const onImageUploadRef = useRef(onImageUpload);
  const onCreateRef = useRef(onCreate);
  const uploadAndReplaceRef = useRef<(file: File, pos?: number) => Promise<void>>(null);

  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onImageUploadRef.current = onImageUpload; }, [onImageUpload]);

  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: content || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onCreate: ({ editor }) => {
      onCreateRef.current(editor);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-content focus:outline-none prose prose-stone dark:prose-invert max-w-none pb-40",
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
              uploadAndReplaceRef.current?.(file, coords?.pos);
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
              uploadAndReplaceRef.current?.(file);
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onUpdateRef.current();
    },
    immediatelyRender: false,
  });

  const uploadAndReplace = useCallback(
    async (file: File, pos?: number) => {
      if (!editor) return;

      const id = Math.random().toString(36).substring(7);
      const localUrl = URL.createObjectURL(file);

      // 1. Insert optimistic image
      if (pos !== undefined) {
        editor
          .chain()
          .focus()
          .insertContentAt(pos, {
            type: "image",
            attrs: { src: localUrl, id, isUploading: true },
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setImage({ src: localUrl, id, isUploading: true })
          .run();
      }

      try {
        // 2. Upload in background
        const remoteUrl = await onImageUploadRef.current(file);

        // 3. Find node and update src using a transaction
        let found = false;
        editor.state.doc.descendants((node, pos) => {
          if (found) return false;
          if (node.type.name === "image" && node.attrs.id === id) {
            editor.view.dispatch(
              editor.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                src: remoteUrl,
                isUploading: false,
              }),
            );
            found = true;
            return false;
          }
        });
      } catch (err) {
        console.error("Upload failed:", err);
        // Remove the failed image node
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.id === id) {
            editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
            return false;
          }
        });
      } finally {
        URL.revokeObjectURL(localUrl);
      }
    },
    [editor],
  );

  useEffect(() => {
    uploadAndReplaceRef.current = uploadAndReplace;
  }, [uploadAndReplace]);

  // Listen for slash-command image insert events
  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/gif,image/webp";
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files) return;
        for (const file of Array.from(input.files)) {
          uploadAndReplace(file);
        }
      };
      input.click();
    };

    document.addEventListener("notesx:insert-image", handler);
    return () => document.removeEventListener("notesx:insert-image", handler);
  }, [editor, uploadAndReplace]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
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
      <TableFloatingMenu editor={editor} />
      <div className="max-w-[720px] mx-auto w-full px-6 py-12 md:px-12">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

export default TiptapEditor;
