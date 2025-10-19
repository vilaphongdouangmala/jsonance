"use client";

import { Textarea } from "@/components/ui/textarea";
import { LineNumbers } from "@/components/ui/line-numbers";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface EditSectionProps {
  jsonInput: string;
  lineCount: number;
  currentLine: number;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
}

export function EditSection({
  jsonInput,
  lineCount,
  currentLine,
  textareaRef,
  lineNumbersRef,
  onInputChange,
}: EditSectionProps) {
  const t = useTranslations();

  return (
    <>
      {/* Line numbers */}
      <LineNumbers
        ref={lineNumbersRef}
        lineCount={lineCount}
        currentLine={currentLine}
        lineHeight="1.5rem"
      />

      {/* JSON textarea */}
      <Textarea
        ref={textareaRef}
        value={jsonInput}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={t("placeholders.jsonInput")}
        className={cn(
          "min-h-[400px] font-mono text-sm flex-1",
          "resize-none overflow-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          "rounded-none py-2"
        )}
        style={{ lineHeight: "1.5rem" }}
      />
    </>
  );
}
