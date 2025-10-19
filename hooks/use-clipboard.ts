"use client";

import { useState, useCallback } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, []);

  return {
    copied,
    copyToClipboard,
  };
}
