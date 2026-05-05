"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Save, Trash2, Plus, X, Check, Loader2 } from "lucide-react";

interface Note {
  _id?: string;
  title: string;
  content: string[];
  folderId?: string | null;
  updatedAt?: string;
}

interface Folder {
  _id: string;
  name: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface NoteEditorProps {
  note: Note;
  folders: Folder[];
  onDelete: (noteId: string) => void;
  onSaved: (note: Note) => void;
}

export default function NoteEditor({
  note,
  folders,
  onDelete,
  onSaved,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState<string[]>(
    note.content?.length ? note.content : [""]
  );
  const [folderId, setFolderId] = useState<string>(note.folderId || "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");

  const contentEndRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isNewNote = !note._id;

  // Keep refs in sync so auto-save always uses latest values
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const folderIdRef = useRef(folderId);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  useEffect(() => {
    folderIdRef.current = folderId;
  }, [folderId]);

  // Sync state when a different note is selected
  useEffect(() => {
    setTitle(note.title || "");
    setContent(note.content?.length ? note.content : [""]);
    setFolderId(note.folderId || "");
    setSaveStatus("idle");
    setError("");
  }, [note._id]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  const saveNote = useCallback(
    async (overrideFolderId?: string) => {
      const currentTitle = titleRef.current;
      const currentContent = contentRef.current;
      const currentFolderId = overrideFolderId ?? folderIdRef.current;

      if (!currentTitle.trim()) {
        setError("Title is required");
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saving");
      setError("");

      const filteredContent = currentContent.filter((c) => c.trim() !== "");

      try {
        const url = isNewNote ? "/api/notes" : `/api/notes/${note._id}`;
        const method = isNewNote ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentTitle,
            content: filteredContent,
            folderId: currentFolderId || null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save note");
        }

        const savedNote = await res.json();
        setSaveStatus("saved");
        onSaved(savedNote);

        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err: any) {
        setError(err.message);
        setSaveStatus("error");
      }
    },
    [isNewNote, note._id, onSaved]
  );

  // Auto-save with debounce (only for existing notes)
  const triggerAutoSave = useCallback(() => {
    if (isNewNote) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      saveNote();
    }, 1500);
  }, [isNewNote, saveNote]);

  // Wrap state changes to trigger auto-save
  const handleTitleChange = (value: string) => {
    setTitle(value);
    triggerAutoSave();
  };

  const handleContentChange = (index: number, value: string) => {
    const newContent = [...content];
    newContent[index] = value;
    setContent(newContent);
    triggerAutoSave();
  };

  const handleFolderChange = (value: string) => {
    setFolderId(value);
    // Save immediately on folder change for existing notes
    if (!isNewNote) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      // Small delay to let the ref update
      setTimeout(() => saveNote(value), 50);
    }
  };

  const handleAddBullet = () => {
    setContent([...content, ""]);
    setTimeout(() => {
      contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleRemoveBullet = (index: number) => {
    if (content.length === 1) {
      setContent([""]);
      return;
    }
    const newContent = content.filter((_, i) => i !== index);
    setContent(newContent);
    triggerAutoSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newContent = [...content];
      newContent.splice(index + 1, 0, "");
      setContent(newContent);
    } else if (
      e.key === "Backspace" &&
      content[index] === "" &&
      content.length > 1
    ) {
      e.preventDefault();
      handleRemoveBullet(index);
    }
  };

  const handleManualSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    saveNote();
  };

  const handleDelete = async () => {
    if (isNewNote || !note._id) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      onDelete(note._id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        );
      case "saved":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500">
            <Check className="w-3 h-3" />
            Saved
          </span>
        );
      case "error":
        return <span className="text-xs text-red-500">Save failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-3">
          {/* Folder selector */}
          <select
            value={folderId}
            onChange={(e) => handleFolderChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 border-none rounded-lg outline-none text-stone-600 dark:text-stone-400 cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <option value="">No Folder</option>
            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
          {renderSaveStatus()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
            title="Save (auto-saves after 1.5s)"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
          {!isNewNote && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-xl space-y-5">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note Title"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700 focus:ring-0 p-0"
          />

          <div className="space-y-1.5">
            {content.map((point, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></span>
                <textarea
                  value={point}
                  onChange={(e) =>
                    handleContentChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="List item..."
                  className="w-full resize-none bg-transparent border-none outline-none py-1 min-h-[32px] overflow-hidden focus:ring-0 text-sm leading-relaxed"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
                <button
                  onClick={() => handleRemoveBullet(index)}
                  className="mt-1 p-1 text-stone-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                  title="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div ref={contentEndRef} />
          </div>

          <button
            onClick={handleAddBullet}
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors py-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
