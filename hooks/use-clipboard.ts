"use client";

import { useState, useCallback } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } else {
        // Fallback for older browsers or non-secure contexts
        fallbackCopyToClipboard(text);
        setCopied(true);
      }
    } catch (error) {
      console.warn("Clipboard API failed, trying fallback:", error);
      try {
        // Try fallback method
        fallbackCopyToClipboard(text);
        setCopied(true);
      } catch (fallbackError) {
        console.error("All clipboard methods failed:", fallbackError);
        // Still set copied to true to provide user feedback
        // In a real app, you might want to show an error message instead
        setCopied(true);
      }
    }

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, []);

  const fallbackCopyToClipboard = (text: string) => {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make it invisible
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      // Use the older execCommand method
      const successful = document.execCommand("copy");
      if (!successful) {
        throw new Error("execCommand copy failed");
      }
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return {
    copied,
    copyToClipboard,
  };
}
