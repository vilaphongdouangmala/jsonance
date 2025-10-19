"use client";

import { useState, useEffect, useRef } from "react";

export function useLineNumbers(jsonInput: string, isPreviewMode: boolean) {
  const [lineCount, setLineCount] = useState<number>(1);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const previewLineNumbersRef = useRef<HTMLDivElement>(null);
  const syntaxHighlighterRef = useRef<HTMLDivElement>(null);

  // Update line numbers when input changes and sync scroll
  useEffect(() => {
    const lines = jsonInput.split("\n").length;
    setLineCount(lines);

    // Sync scroll position between textarea and line numbers in edit mode
    const syncScrollEdit = () => {
      if (lineNumbersRef.current && textareaRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    };

    // Sync scroll position between syntax highlighter and line numbers in preview mode
    const syncScrollPreview = () => {
      if (previewLineNumbersRef.current && syntaxHighlighterRef.current) {
        previewLineNumbersRef.current.scrollTop =
          syntaxHighlighterRef.current.scrollTop;
      }
    };

    // Get current cursor position line
    const updateCurrentLine = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = jsonInput.substring(0, cursorPosition);
        const line = textBeforeCursor.split("\n").length;
        setCurrentLine(line);
      }
    };

    // Set up event listeners for edit mode
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("scroll", syncScrollEdit);
      textarea.addEventListener("click", updateCurrentLine);
      textarea.addEventListener("keyup", updateCurrentLine);
    }

    // Set up event listeners for preview mode
    const syntaxHighlighter = syntaxHighlighterRef.current;
    if (syntaxHighlighter) {
      syntaxHighlighter.addEventListener("scroll", syncScrollPreview);
    }

    return () => {
      // Clean up edit mode listeners
      if (textarea) {
        textarea.removeEventListener("scroll", syncScrollEdit);
        textarea.removeEventListener("click", updateCurrentLine);
        textarea.removeEventListener("keyup", updateCurrentLine);
      }

      // Clean up preview mode listeners
      if (syntaxHighlighter) {
        syntaxHighlighter.removeEventListener("scroll", syncScrollPreview);
      }
    };
  }, [jsonInput, isPreviewMode]);

  return {
    lineCount,
    currentLine,
    textareaRef,
    lineNumbersRef,
    previewLineNumbersRef,
    syntaxHighlighterRef,
  };
}
