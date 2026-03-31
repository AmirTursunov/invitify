"use client";
import React, { useRef, useEffect } from 'react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  isView?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export default function EditableField({
  value,
  onChange,
  isView,
  placeholder = "Kiriting...",
  className = "",
  style = {},
  multiline = false
}: EditableFieldProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // Set initial text only once when not in view mode
  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerText !== value) {
      // Basic check to prevent losing cursor position on every re-render
      // In a more robust setup, you might manage selection ranges
    }
  }, [value]);

  if (isView) {
    return (
      <div 
        className={className} 
        style={style}
      >
        {value || placeholder}
      </div>
    );
  }

  return (
    <div
      ref={contentEditableRef}
      contentEditable
      suppressContentEditableWarning
      className={`outline-none transition-all hover:ring-2 hover:ring-purple-400/50 focus:ring-2 focus:ring-purple-500 rounded-md px-1 min-w-[20px] empty:before:content-[attr(data-placeholder)] empty:before:text-inherit empty:before:opacity-40 cursor-text ${className}`}
      style={style}
      data-placeholder={placeholder}
      onBlur={(e) => {
        onChange(e.currentTarget.innerText);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      // Set dangerouslySetInnerHTML only for initial load to avoid jumping cursors during typing
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  );
}
