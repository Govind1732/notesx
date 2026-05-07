"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export default function ResizableImageComponent({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const [resizing, setResizing] = useState(false);
  const [width, setWidth] = useState(node.attrs.width);
  const imageRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setResizing(true);
      startX.current = event.clientX;
      if (imageRef.current) {
        startWidth.current = imageRef.current.offsetWidth;
      }

      const onMouseMove = (moveEvent: MouseEvent) => {
        const diff = moveEvent.clientX - startX.current;
        const newWidth = Math.max(100, startWidth.current + diff);
        setWidth(`${newWidth}px`);
      };

      const onMouseUp = () => {
        setResizing(false);
        updateAttributes({ width: `${imageRef.current?.offsetWidth}px` });
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes],
  );

  const setAlign = (align: string) => {
    updateAttributes({ align });
  };

  const alignmentClass = 
    node.attrs.align === 'left' ? 'justify-start' : 
    node.attrs.align === 'right' ? 'justify-end' : 
    'justify-center';

  return (
    <NodeViewWrapper className={`flex w-full my-8 ${alignmentClass}`}>
      <div 
        className={`relative group inline-block ${selected ? 'ring-2 ring-stone-400 rounded-lg' : ''}`}
        style={{ width: width }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          className={`block rounded-lg transition-all ${
            node.attrs.isUploading ? "opacity-50 blur-sm" : ""
          }`}
          style={{ width: '100%', height: 'auto' }}
        />

        {node.attrs.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
          </div>
        )}

        {selected && !node.attrs.isUploading && (
          <>
            {/* Resize Handle */}
            <div
              onMouseDown={onMouseDown}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-stone-400/50 transition-colors z-10"
            />
            
            {/* Alignment Controls */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl p-1 flex items-center gap-0.5 z-20 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setAlign('left')}
                className={`p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10 ${node.attrs.align === 'left' ? 'text-blue-500' : 'text-stone-500'}`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAlign('center')}
                className={`p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10 ${node.attrs.align === 'center' ? 'text-blue-500' : 'text-stone-500'}`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAlign('right')}
                className={`p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10 ${node.attrs.align === 'right' ? 'text-blue-500' : 'text-stone-500'}`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
