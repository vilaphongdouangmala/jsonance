"use client";

import { JsonTree } from "./json-tree";
import { SyntaxHighlighter } from "./syntax-highlighter";
import { LineNumbers } from "@/components/ui/line-numbers";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import type { JsonValue } from "@/features/json-formatter/types/json";

interface PreviewSectionProps {
  isTreeView: boolean;
  jsonInput: string;
  formattedJson: string;
  previewLineNumbersRef: React.RefObject<HTMLDivElement | null>;
  syntaxHighlighterRef: React.RefObject<HTMLDivElement | null>;
  onCopy: (value: string) => Promise<void> | void;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
  onDataChange?: (newData: JsonValue) => void;
  isInlineEditEnabled?: boolean;
}

export function PreviewSection({
  isTreeView,
  jsonInput,
  formattedJson,
  previewLineNumbersRef,
  syntaxHighlighterRef,
  onCopy,
  expandAllTrigger,
  collapseAllTrigger,
  onDataChange,
  isInlineEditEnabled = true,
}: PreviewSectionProps) {
  const t = useTranslations();
  const content = formattedJson || jsonInput;
  const treeContainerRef = useRef<HTMLDivElement>(null);

  if (!content.trim()) {
    return (
      <div className="w-full h-[65vh] min-h-[300px] p-4 flex items-center justify-center text-muted-foreground">
        {t("placeholders.nothingToPreview")}
      </div>
    );
  }

  if (isTreeView) {
    return (
      <>
        <div
          ref={treeContainerRef}
          className="h-[65vh] min-h-[300px] w-full overflow-auto"
        >
          <JsonTree
            data={content}
            className="w-full p-4"
            onCopy={onCopy}
            expandAllTrigger={expandAllTrigger}
            collapseAllTrigger={collapseAllTrigger}
            onDataChange={onDataChange}
            isInlineEditEnabled={isInlineEditEnabled}
          />
        </div>
        <ScrollToTop containerRef={treeContainerRef} />
      </>
    );
  }

  return (
    <>
      {/* Line numbers in syntax view */}
      <LineNumbers
        ref={previewLineNumbersRef}
        lineCount={content.split("\n").length}
        lineHeight="1.5rem"
        className="h-[65vh] min-h-[300px]"
      />

      {/* Syntax highlighted code */}
      <div
        ref={syntaxHighlighterRef}
        className="flex-1 h-[65vh] min-h-[300px] overflow-auto"
      >
        <SyntaxHighlighter
          code={content}
          language="json"
          className="h-full m-0 text-sm"
          lineHeight="1.45rem"
        />
      </div>

      {/* Scroll to top button */}
      <ScrollToTop containerRef={syntaxHighlighterRef} />
    </>
  );
}
