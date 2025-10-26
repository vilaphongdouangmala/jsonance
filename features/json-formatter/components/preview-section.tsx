"use client";

import { JsonTree } from "./json-tree";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import type { JsonValue } from "@/features/json-formatter/types/json";

interface PreviewSectionProps {
  jsonInput: string;
  formattedJson: string;
  onCopy: (value: string) => Promise<void> | void;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
  onDataChange?: (newData: JsonValue) => void;
  isInlineEditEnabled?: boolean;
}

export function PreviewSection({
  jsonInput,
  formattedJson,
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
