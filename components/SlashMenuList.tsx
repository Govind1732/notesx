"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { SlashCommandItem } from "@/lib/slashCommands";

interface SlashMenuListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

const SlashMenuList = forwardRef((props: SlashMenuListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((((selectedIndex + props.items.length) - 1) % props.items.length));
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  return (
    <div className="slash-menu">
      {props.items.length > 0 ? (
        props.items.map((item, index) => (
          <button
            key={index}
            className={`slash-menu-item ${index === selectedIndex ? "is-selected" : ""}`}
            onClick={() => selectItem(index)}
          >
            <div className="slash-menu-icon">{item.icon}</div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {item.description}
              </span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-stone-500">No results found</div>
      )}
    </div>
  );
});

SlashMenuList.displayName = "SlashMenuList";

export default SlashMenuList;
