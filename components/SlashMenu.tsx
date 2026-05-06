"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";

interface SlashMenuItem {
  title: string;
  description: string;
  icon: string;
  command: () => void;
}

interface SlashMenuProps {
  items: SlashMenuItem[];
  onClose: () => void;
}

const SlashMenu = forwardRef<{ onKeyDown: (e: KeyboardEvent) => boolean }, SlashMenuProps>(
  ({ items, onClose }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }
        if (e.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (e.key === "Enter") {
          items[selectedIndex]?.command();
          return true;
        }
        if (e.key === "Escape") {
          onClose();
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="slash-menu">
          <div className="px-3 py-2.5 text-sm text-stone-400">No results</div>
        </div>
      );
    }

    return (
      <div ref={menuRef} className="slash-menu">
        {items.map((item, index) => (
          <button
            key={item.title}
            onClick={item.command}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`slash-menu-item ${index === selectedIndex ? "is-selected" : ""}`}
          >
            <span className="slash-menu-icon">{item.icon}</span>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-stone-400 dark:text-stone-500">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

SlashMenu.displayName = "SlashMenu";

export default SlashMenu;
export type { SlashMenuItem };
