"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  MoreVertical,
} from "lucide-react";
import { useInlineRename } from "./useInlineRename";
import { uploadImage } from "@/lib/uploadImage";
import TiptapEditor from "./TiptapEditor";
import EditorToolbar from "./EditorToolbar";
import { Note, Folder } from "@/types";
import { useNoteMutations } from "@/hooks/useNoteMutations";

import TurndownService from "turndown";

type SaveStatus = "idle" | "saving" | "saved" | "error";

import { useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";

interface NoteEditorProps {
  note: Note;
  folders: Folder[];
}

export default function NoteEditor({
  note,
  folders,
}: NoteEditorProps) {
// ... existing state ...

  const exportMarkdown = useCallback(() => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.getHTML();
    const turndownService = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
    });
    
    const markdown = turndownService.turndown(html);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileNameRef.current || "Untitled"}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  }, []);
  const [selectedFolderId] = useQueryState("folder", parseAsString);
  const [, setSelectedNoteId] = useQueryState("note", parseAsString);
  const [creatingNew, setCreatingNew] = useQueryState("new", parseAsBoolean);
  
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState(note.fileName || "Untitled");
  const defaultFolder = folders.length > 0 ? folders[0]._id : "";
  const [folderId, setFolderId] = useState<string>(
    note.folderId || defaultFolder,
  );
  
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const { saveNote, deleteNote } = useNoteMutations(note.folderId || null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isNewNote = !note._id;

  const fileNameRef = useRef(fileName);
  const folderIdRef = useRef(folderId);

  useEffect(() => {
    fileNameRef.current = fileName;
  }, [fileName]);

  useEffect(() => {
    folderIdRef.current = folderId;
  }, [folderId]);

  useEffect(() => {
    setFileName(note.fileName || "Untitled");
    setFolderId(note.folderId || defaultFolder);
    setSaveStatus("idle");
    setError("");
    setConfirmDelete(false);
    setMenuOpen(false);
    setEditorInstance(null);
  }, [note._id, defaultFolder]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const handleSave = useCallback(
    async (overrideFolderId?: string) => {
      const currentFileName = String(fileNameRef.current || "").trim();
      const currentContent = editorRef.current?.getJSON() || null;
      const currentFolderId = overrideFolderId ?? folderIdRef.current;

      if (!currentFileName) {
        setError("File name is required");
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saving");
      setError("");

      try {
        const savedNote = await saveNote({
          noteId: note._id,
          data: {
            fileName: currentFileName,
            title: note.title ?? null,
            content: currentContent,
            folderId: currentFolderId || null,
          },
        });

        setSaveStatus("saved");
        
        // Handle navigation and state logic
        if (creatingNew && savedNote._id) {
          setCreatingNew(null);
          setSelectedNoteId(savedNote._id);
        }

        // Folder logic: if a new folder was created implicitly, we still need to invalidate folders
        if (
          savedNote.folderId &&
          !folders.some((folder) => folder._id === savedNote.folderId)
        ) {
          queryClient.invalidateQueries({ queryKey: ["folders"] });
        }

        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err: any) {
        setError(err.message);
        setSaveStatus("error");
      }
    },
    [note._id, note.title, saveNote, creatingNew, folders, queryClient, setCreatingNew, setSelectedNoteId],
  );

  const triggerAutoSave = useCallback(() => {
    if (isNewNote) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => handleSave(), 1500);
  }, [isNewNote, handleSave]);

  const handleEditorUpdate = useCallback(
    () => {
      triggerAutoSave();
    },
    [triggerAutoSave],
  );

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const result = await uploadImage(file);
    return result.url;
  }, []);

  const handleEditorCreate = useCallback((editor: any) => {
    editorRef.current = editor;
    setEditorInstance(editor);
  }, []);

  const handleManualSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    handleSave();
  }, [handleSave]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  const handleDelete = async () => {
    if (isNewNote || !note._id) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await deleteNote(note._id);
      
      // Handle navigation logic
      setSelectedNoteId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRenameFileName = async (newFileName: string) => {
    setFileName(newFileName);
    if (!note._id) return;

    try {
        await saveNote({
            noteId: note._id,
            data: { fileName: newFileName }
        });
    } catch (err: any) {
        setError(err.message);
    }
  };

  const {
    isRenaming,
    value,
    setValue,
    error: renameError,
    inputRef,
    startRename,
    saveRename,
    handleInputKeyDown,
  } = useInlineRename(fileName, handleRenameFileName);

  const onBack = () => {
    setSelectedNoteId(null);
    setCreatingNew(null);
  };

  const folderName =
    folders.length === 0
      ? "Untitled"
      : folders.find((f) => f._id === folderId)?.name || "Untitled";

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#0C0C0C]">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0 bg-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0 text-xs text-stone-400 dark:text-stone-500">
            <span>Workspace</span>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <span className="truncate">{folderName}</span>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <span className="min-w-0 flex-1 truncate">
              {isRenaming ? (
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={() => void saveRename()}
                  onKeyDown={handleInputKeyDown}
                  className="w-full min-w-0 text-sm font-semibold bg-white dark:bg-[#111111] border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-white/20 transition-colors"
                  aria-label="Rename note"
                />
              ) : (
                <button
                  onClick={startRename}
                  className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  {fileName || "Untitled"}
                </button>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus !== "idle" && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-100 dark:bg-white/5 text-[10px] font-medium text-stone-500 dark:text-stone-400 transition-all animate-in fade-in slide-in-from-right-1">
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500/90">Saved</span>
                </>
              ) : (
                <span className="text-rose-500">Error saving</span>
              )}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-stone-500 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.06] transition-colors"
              aria-label="Open note actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 min-w-[220px] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#111111] shadow-xl z-20 overflow-hidden">
                <div className="px-4 py-3 text-xs uppercase tracking-[0.24em] text-stone-400 dark:text-stone-500">
                  Note info
                </div>
                <div className="px-4 py-2 text-sm text-stone-700 dark:text-stone-200">
                  Created{" "}
                  {note.createdAt
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(note.createdAt))
                    : "—"}
                </div>
                <div className="px-4 pb-3 text-sm text-stone-700 dark:text-stone-200">
                  Updated{" "}
                  {note.updatedAt
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(note.updatedAt))
                    : "—"}
                </div>
                <div className="border-t border-black/[0.06] dark:border-white/[0.06]" />
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isNewNote || !note._id}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] disabled:text-stone-400 disabled:dark:text-stone-600 disabled:hover:bg-transparent"
                >
                  {confirmDelete ? "Confirm delete" : "Delete note"}
                </button>
                <div className="border-t border-black/[0.06] dark:border-white/[0.06]" />
                <button
                  type="button"
                  onClick={exportMarkdown}
                  className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                >
                  Export as Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sticky Toolbar */}
      {editorInstance && (
        <div className="sticky top-0 z-20">
          <EditorToolbar
            editor={editorInstance}
            onImageInsert={() => {
              const event = new CustomEvent("notesx:insert-image");
              document.dispatchEvent(event);
            }}
          />
        </div>
      )}

      {error && (
        <div className="mx-6 mt-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      {renameError && (
        <div className="mx-6 mt-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg text-xs font-medium">
          {renameError}
        </div>
      )}

      {/* 3. Editor Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <TiptapEditor
          key={note._id || "new-note"}
          content={note.content}
          onCreate={handleEditorCreate}
          onUpdate={handleEditorUpdate}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
}
