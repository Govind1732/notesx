"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  Circle,
} from "lucide-react";
import { uploadImage } from "@/lib/uploadImage";
import TiptapEditor from "./TiptapEditor";

interface Note {
  _id?: string;
  title: string;
  content: any;
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
  onBack: () => void;
}

export default function NoteEditor({
  note,
  folders,
  onDelete,
  onSaved,
  onBack,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || "");
  const [editorContent, setEditorContent] = useState<any>(note.content || null);
  const defaultFolder = folders.length > 0 ? folders[0]._id : "";
  const [folderId, setFolderId] = useState<string>(note.folderId || defaultFolder);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isNewNote = !note._id;

  const titleRef = useRef(title);
  const contentRef = useRef(editorContent);
  const folderIdRef = useRef(folderId);

  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { contentRef.current = editorContent; }, [editorContent]);
  useEffect(() => { folderIdRef.current = folderId; }, [folderId]);

  useEffect(() => {
    setTitle(note.title || "");
    setEditorContent(note.content || null);
    setFolderId(note.folderId || defaultFolder);
    setSaveStatus("idle");
    setError("");
    setConfirmDelete(false);
  }, [note._id]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
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

      try {
        const url = isNewNote ? "/api/notes" : `/api/notes/${note._id}`;
        const method = isNewNote ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentTitle,
            content: currentContent,
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
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err: any) {
        setError(err.message);
        setSaveStatus("error");
      }
    },
    [isNewNote, note._id, onSaved]
  );

  const triggerAutoSave = useCallback(() => {
    if (isNewNote) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveNote(), 1500);
  }, [isNewNote, saveNote]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    triggerAutoSave();
  };

  const handleEditorUpdate = useCallback(
    (json: any) => {
      contentRef.current = json;
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      const result = await uploadImage(file);
      return result.url;
    },
    []
  );

  const handleManualSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    saveNote();
  };

  const handleDelete = async () => {
    if (isNewNote || !note._id) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      const res = await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      onDelete(note._id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Folder name
  const folderName =
    folders.length === 0
      ? "Untitled"
      : folders.find((f) => f._id === folderId)?.name || "Untitled";

  return (
    <div className="flex flex-col h-full w-full">
      {/* Minimal header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0 bg-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-stone-400 dark:text-stone-500 truncate">
            {folderName}
          </span>

          <span className="text-stone-300 dark:text-stone-700 text-xs">·</span>

          {/* Save status */}
          {saveStatus === "saving" && (
            <span className="inline-flex items-center gap-1 text-xs text-stone-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Saving</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 animate-in fade-in duration-300">
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">Saved</span>
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-500">Failed</span>
          )}
          {saveStatus === "idle" && !isNewNote && (
            <button
              onClick={handleManualSave}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors cursor-pointer"
            >
              Save
            </button>
          )}
          {saveStatus === "idle" && isNewNote && (
            <button
              onClick={handleManualSave}
              className="text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              Save
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isNewNote && (
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer inline-flex items-center gap-1 text-xs ${
                confirmDelete
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
              title="Delete Note"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete && <span>Delete?</span>}
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-6 mt-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      {/* Editor area: title + body scroll together */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Title */}
        <div className="max-w-[720px] mx-auto px-6 pt-10 pb-1 md:px-8">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full text-[2.5rem] font-bold bg-transparent border-none outline-none placeholder:text-stone-200 dark:placeholder:text-stone-800 focus:ring-0 p-0 leading-tight tracking-tight text-stone-900 dark:text-stone-50"
          />
        </div>

        {/* Tiptap Editor */}
        <TiptapEditor
          content={editorContent}
          onUpdate={handleEditorUpdate}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
}
