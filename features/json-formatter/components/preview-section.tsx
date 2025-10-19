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
}

export function PreviewSection({
  isTreeView,
  jsonInput,
  formattedJson,
  previewLineNumbersRef,
  syntaxHighlighterRef,
  onCopy,
}: PreviewSectionProps) {
  const t = useTranslations();
  const content = formattedJson || jsonInput;

  if (!content.trim()) {
    return (
      <div className="w-full min-h-[400px] p-4 flex items-center justify-center text-muted-foreground">
        {t("placeholders.nothingToPreview")}
      </div>
    );
  }

  if (isTreeView) {
    return (
      <JsonTree
        data={content}
        className="min-h-[400px] w-full p-4"
        onCopy={onCopy}
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
      />

      {/* Syntax highlighted code */}
      <div ref={syntaxHighlighterRef} className="flex-1 overflow-auto">
        <SyntaxHighlighter
          code={content}
          language="json"
          className="min-h-[400px] m-0 overflow-auto text-sm"
          lineHeight="1.45rem"
        />
      </div>
    </>
  );
}
