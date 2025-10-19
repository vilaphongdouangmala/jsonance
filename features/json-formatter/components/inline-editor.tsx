"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SimpleJsonValue = string | number | boolean | null;

interface InlineEditorProps {
  value: SimpleJsonValue;
  onSave: (newValue: SimpleJsonValue) => void;
  onCancel: () => void;
  className?: string;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  value,
  onSave,
  onCancel,
  className,
}) => {
  // Initialize with smart formatting
  const getInitialValue = (val: SimpleJsonValue): string => {
    if (val === null) return "null";
    if (typeof val === "string") return val; // Don't add quotes initially
    return String(val);
  };

  const [editValue, setEditValue] = useState<string>(getInitialValue(value));
  const [isValid, setIsValid] = useState(true);
  const [previewType, setPreviewType] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus and select all text when editor appears
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const validateAndSave = () => {
    let parsedValue: SimpleJsonValue;

    try {
      // Intelligent type detection based on input
      const trimmed = editValue.trim();

      // Handle explicit null
      if (trimmed === "null") {
        parsedValue = null;
      }
      // Handle explicit booleans
      else if (trimmed === "true") {
        parsedValue = true;
      } else if (trimmed === "false") {
        parsedValue = false;
      }
      // Handle quoted strings (user explicitly wants string)
      else if (
        trimmed.startsWith('"') &&
        trimmed.endsWith('"') &&
        trimmed.length >= 2
      ) {
        parsedValue = trimmed.slice(1, -1); // Remove quotes
      }
      // Handle numbers (including negative and decimals)
      else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!isNaN(num) && isFinite(num)) {
          parsedValue = num;
        } else {
          parsedValue = trimmed; // Fallback to string
        }
      }
      // Everything else is treated as a string
      else {
        parsedValue = trimmed;
      }

      onSave(parsedValue);
      setIsValid(true);
    } catch {
      // If anything fails, treat as string
      onSave(editValue.trim());
      setIsValid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        validateAndSave();
        break;
      case "Escape":
        e.preventDefault();
        onCancel();
        break;
    }
  };

  const handleBlur = () => {
    validateAndSave();
  };

  // Helper function to detect what type the current input would become
  const detectType = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return "string";

    if (trimmed === "null") return "null";
    if (trimmed === "true" || trimmed === "false") return "boolean";
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2)
      return "string";
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return "number";
    return "string";
  };

  // Update type preview when input changes
  useEffect(() => {
    setPreviewType(detectType(editValue));
  }, [editValue]);

  // Helper function to get placeholder text based on current value type
  const getPlaceholder = (): string => {
    return 'Type: null, true, 5000, "text", etc.';
  };

  // Get type color based on detected type
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string":
        return "text-green-600";
      case "number":
        return "text-blue-600";
      case "boolean":
        return "text-purple-600";
      case "null":
        return "text-gray-500";
      default:
        return "text-muted-foreground";
    }
  };

  // Single freeform text editor for all types
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setEditValue(e.target.value);
          setIsValid(true); // Reset validation on change
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn(
          "h-6 text-xs font-mono pr-12", // Add padding for type indicator
          !isValid && "border-red-500",
          className
        )}
        placeholder={getPlaceholder()}
      />
      {/* Type indicator */}
      {editValue.trim() && (
        <div
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 px-1 py-0.5 text-xs rounded",
            "bg-muted/50 border text-muted-foreground",
            getTypeColor(previewType)
          )}
        >
          {previewType}
        </div>
      )}
    </div>
  );
};
