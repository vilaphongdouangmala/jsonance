"use client";

import { useTranslations } from "next-intl";
import { LineNumbers } from "@/components/ui/line-numbers";
import { JsonTree } from "@/features/json-formatter/components/json-tree";
import { SyntaxHighlighter } from "./syntax-highlighter";

interface PreviewSectionProps {
  isTreeView: boolean;
  jsonInput: string;
  formattedJson: string;
  previewLineNumbersRef: React.RefObject<HTMLDivElement | null>;
  syntaxHighlighterRef: React.RefObject<HTMLDivElement | null>;
  onCopy: (value: string) => Promise<void> | void;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
  onDataChange?: (newData: any) => void;
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

  if (!content.trim()) {
    return (
      <div className="w-full h-[65vh] min-h-[300px] p-4 flex items-center justify-center text-muted-foreground">
        {t("placeholders.nothingToPreview")}
      </div>
    );
  }

  if (isTreeView) {
    return (
      <JsonTree
        data={content}
        className="h-[65vh] min-h-[300px] w-full p-4 overflow-auto"
        onCopy={onCopy}
        expandAllTrigger={expandAllTrigger}
        collapseAllTrigger={collapseAllTrigger}
        onDataChange={onDataChange}
        isInlineEditEnabled={isInlineEditEnabled}
      />
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
          className="h-full m-0 overflow-auto text-sm"
          lineHeight="1.45rem"
        />
      </div>
    </>
  );
}
