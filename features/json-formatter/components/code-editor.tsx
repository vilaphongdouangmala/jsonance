"use client";

import { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import {
  EditorView,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  drawSelection,
} from "@codemirror/view";
import {
  syntaxHighlighting,
  HighlightStyle,
  bracketMatching,
} from "@codemirror/language";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { tags as t } from "@lezer/highlight";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// JSON token colors, tuned to match the tree's palette (green strings, blue
// numbers, purple booleans/null). One style works for both themes because the
// hues stay legible on either background; the editor background/foreground come
// from the theme extension below.
const highlightStyle = HighlightStyle.define([
  { tag: t.string, color: "#16a34a" },
  { tag: [t.number, t.integer], color: "#2563eb" },
  { tag: [t.bool, t.null, t.keyword], color: "#9333ea" },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "#0f766e" },
  { tag: [t.punctuation, t.separator, t.bracket], color: "#64748b" },
]);

// Layout rules that don't depend on light/dark. Kept separate so the theme
// compartment only swaps colors.
const baseTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "0.875rem" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
  },
  ".cm-content": { fontFamily: "inherit" },
});

const lightTheme = EditorView.theme(
  {
    "&": { backgroundColor: "transparent", color: "inherit" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#94a3b8",
      border: "none",
      borderRight: "1px solid var(--border)",
    },
    ".cm-activeLineGutter": { backgroundColor: "rgba(0,0,0,0.04)" },
    ".cm-activeLine": { backgroundColor: "rgba(0,0,0,0.03)" },
    ".cm-cursor": { borderLeftColor: "currentColor" },
  },
  { dark: false }
);

const darkTheme = EditorView.theme(
  {
    "&": { backgroundColor: "transparent", color: "inherit" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#64748b",
      border: "none",
      borderRight: "1px solid var(--border)",
    },
    ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.06)" },
    ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.04)" },
    ".cm-cursor": { borderLeftColor: "currentColor" },
  },
  { dark: true }
);

// Extract a { line, column } from a V8 JSON.parse SyntaxError message.
// Modern V8: "... at position N (line L column C)". Older: "... at position N".
function errorRange(
  message: string,
  doc: EditorState["doc"]
): { from: number; to: number } {
  const lineCol = message.match(/line (\d+) column (\d+)/i);
  if (lineCol) {
    const lineNo = Math.min(parseInt(lineCol[1], 10), doc.lines);
    const line = doc.line(lineNo);
    const col = parseInt(lineCol[2], 10);
    const from = Math.min(line.from + Math.max(0, col - 1), line.to);
    return { from, to: line.to };
  }
  const posMatch = message.match(/at position (\d+)/i);
  if (posMatch) {
    const pos = Math.min(parseInt(posMatch[1], 10), doc.length);
    const line = doc.lineAt(pos);
    return { from: pos, to: line.to };
  }
  return { from: 0, to: doc.length };
}

const jsonLinter = linter(
  (view): Diagnostic[] => {
    const doc = view.state.doc;
    const text = doc.toString();
    if (!text.trim()) return [];
    try {
      JSON.parse(text);
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid JSON";
      const { from, to } = errorRange(message, doc);
      return [{ from, to: Math.max(from + 1, to), severity: "error", message }];
    }
  },
  { delay: 300 }
);

export function CodeEditor({
  value,
  onChange,
  placeholder,
  className,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const themeCompartment = useRef(new Compartment());
  const { resolvedTheme } = useTheme();

  // Keep the latest onChange without re-creating the editor.
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        baseTheme,
        lineNumbers(),
        lintGutter(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        history(),
        bracketMatching(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        json(),
        jsonLinter,
        syntaxHighlighting(highlightStyle),
        EditorView.lineWrapping,
        themeCompartment.current.of(
          resolvedTheme === "dark" ? darkTheme : lightTheme
        ),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.contentAttributes.of({ "aria-label": placeholder ?? "" }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Intentionally mount-once. Value/theme sync handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (Format / Minify / data edits) without
  // clobbering the cursor while the user types.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Swap the theme via compartment (no view recreation).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(
        resolvedTheme === "dark" ? darkTheme : lightTheme
      ),
    });
  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full overflow-auto text-sm", className)}
    />
  );
}
