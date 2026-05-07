"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export function useInlineRename(
  initialValue: string,
  onCommit: (value: string) => Promise<void>,
) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isRenaming) {
      setValue(initialValue);
      setError(null);
    }
  }, [initialValue, isRenaming]);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const startRename = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsRenaming(true);
  }, [initialValue]);

  const cancelRename = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsRenaming(false);
  }, [initialValue]);

  const saveRename = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return false;
    }

    if (trimmed === initialValue.trim()) {
      setIsRenaming(false);
      return true;
    }

    try {
      await onCommit(trimmed);
      setIsRenaming(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "Unable to save");
      return false;
    }
  }, [initialValue, onCommit, value]);

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void saveRename();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        cancelRename();
      }
    },
    [cancelRename, saveRename],
  );

  return {
    isRenaming,
    value,
    setValue,
    error,
    inputRef,
    startRename,
    cancelRename,
    saveRename,
    handleInputKeyDown,
  };
}
