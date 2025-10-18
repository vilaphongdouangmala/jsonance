"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  className?: string;
  lineHeight?: string;
}

export function SyntaxHighlighter({
  code,
  language,
  className,
  lineHeight,
}: SyntaxHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, theme]); // Re-highlight when theme changes

  return (
    <pre className={cn("bg-transparent", className)}>
      <code
        ref={codeRef}
        className={`language-${language}`}
        style={{ lineHeight }}
      >
        {code}
      </code>
    </pre>
  );
}
