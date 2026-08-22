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
  foldGutter,
  foldKeymap,
  foldAll,
  unfoldAll,
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
  /**
   * Bumped by the toolbar's "Collapse All" to fold every container. Watched by
   * an effect below (same counter-trigger idiom the tree uses for expand/collapse
   * all). Folds are ephemeral, so a stale trigger has no bad effect.
   */
  foldAllTrigger?: number;
  /** Bumped by the toolbar's "Expand All" to unfold every container. */
  unfoldAllTrigger?: number;
}

// JSON token colors, one palette per theme. These mirror the tree's Tailwind
// `dark:` variants in json-row.tsx so the editor and the tree read the same:
// green strings, blue numbers, purple booleans/null, teal keys, slate
// punctuation — each step tuned for contrast on its background.
const lightHighlightStyle = HighlightStyle.define([
  { tag: t.string, color: "#16a34a" }, // green-600
  { tag: [t.number, t.integer], color: "#2563eb" }, // blue-600
  { tag: [t.bool, t.null, t.keyword], color: "#9333ea" }, // purple-600
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "#0f766e" }, // teal-700
  { tag: [t.punctuation, t.separator, t.bracket], color: "#64748b" }, // slate-500
]);

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.string, color: "#22c55e" }, // green-500
  { tag: [t.number, t.integer], color: "#60a5fa" }, // blue-400
  { tag: [t.bool, t.null, t.keyword], color: "#c084fc" }, // purple-400
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "oklch(96.8% 0.007 247.896)" }, // slate-100
  { tag: [t.punctuation, t.separator, t.bracket], color: "#94a3b8" }, // slate-400
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
  // Fold-gutter arrows: the default glyphs render small and sit high against
  // the line-number text. Match the line height so they centre on the row,
  // and bump the size so the ▸/▾ is legible.
  ".cm-foldGutter .cm-gutterElement": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.15rem",
    lineHeight: "1",
    // The ▸/▾ glyph's visual weight sits below its box centre, so nudge it up
    // to line up with the line-number digits.
    paddingBottom: "3px",
    cursor: "pointer",
  },
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

// The theme and its matching token colors travel together in one compartment,
// so a theme switch swaps both the chrome and the syntax highlighting at once.
function themeExtension(dark: boolean) {
  return dark
    ? [darkTheme, syntaxHighlighting(darkHighlightStyle)]
    : [lightTheme, syntaxHighlighting(lightHighlightStyle)];
}

// The whole document, as a last resort. Preferred only when we truly have no
// idea where the error is — better than nothing, worse than any narrower guess.
function wholeLastLine(doc: EditorState["doc"]): { from: number; to: number } {
  // Errors with no position are almost always truncation / a stray token near
  // the end, so mark the last non-blank line rather than painting the whole doc.
  for (let n = doc.lines; n >= 1; n--) {
    const line = doc.line(n);
    if (line.text.trim() !== "") return { from: line.from, to: line.to };
  }
  return { from: 0, to: doc.length };
}

// Extract a { line, column } from a V8 JSON.parse SyntaxError message.
// V8 comes in three shapes, only the first two of which carry a location:
//   1. "... at position N (line L column C)"  — modern, has line/column
//   2. "... at position N"                    — older, has an offset
//   3. "Unexpected token 'X', \"<snippet>\" is not valid JSON" and
//      "Unexpected end of JSON input"          — NO location at all
// For shape 3 we recover a narrow range instead of underlining the whole file
// (which is what a naive fallback does, and which is worst on exactly the most
// common mistakes: trailing comma, missing value, truncated input).
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

  // Shape 3a: a snippet is quoted. V8 truncates it from the left with "..." and
  // ends it at the offending token, so the snippet's *tail* sits at (or very
  // near) the error. Locate that tail in the document.
  const snippetMatch = message.match(/"([\s\S]*)" is not valid JSON/);
  if (snippetMatch) {
    const text = doc.toString();
    let snippet = snippetMatch[1];
    if (snippet.startsWith("...")) snippet = snippet.slice(3);
    // The tail is the reliable part; match on the last chunk of it.
    const tail = snippet.slice(-40);
    const idx = tail ? text.lastIndexOf(tail) : -1;
    if (idx !== -1) {
      const end = Math.min(idx + tail.length, doc.length);
      const line = doc.lineAt(end);
      return { from: line.from, to: line.to };
    }
  }

  // Shape 3b (e.g. "Unexpected end of JSON input") or an unlocatable snippet.
  return wholeLastLine(doc);
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
  foldAllTrigger,
  unfoldAllTrigger,
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
        foldGutter(),
        lintGutter(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        history(),
        bracketMatching(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
        json(),
        jsonLinter,
        EditorView.lineWrapping,
        themeCompartment.current.of(themeExtension(resolvedTheme === "dark")),
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

  // Swap the theme (chrome + token colors) via compartment, no view recreation.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(
        themeExtension(resolvedTheme === "dark")
      ),
    });
  }, [resolvedTheme]);

  // Fold-all / unfold-all, driven by the toolbar via counter triggers. The
  // initial 0 is ignored (same guard the tree uses) so mounting doesn't fold.
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !foldAllTrigger) return;
    foldAll(view);
  }, [foldAllTrigger]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !unfoldAllTrigger) return;
    unfoldAll(view);
  }, [unfoldAllTrigger]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full overflow-auto text-sm", className)}
    />
  );
}
