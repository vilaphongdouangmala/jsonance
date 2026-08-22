"use client";

import { CodeEditor } from "./code-editor";
import { useTranslations } from "next-intl";

interface EditSectionProps {
  jsonInput: string;
  onInputChange: (value: string) => void;
  foldAllTrigger?: number;
  unfoldAllTrigger?: number;
}

export function EditSection({
  jsonInput,
  onInputChange,
  foldAllTrigger,
  unfoldAllTrigger,
}: EditSectionProps) {
  const t = useTranslations();

  return (
    <div className="h-[65vh] min-h-[300px] w-full">
      <CodeEditor
        value={jsonInput}
        onChange={onInputChange}
        placeholder={t("placeholders.jsonInput")}
        foldAllTrigger={foldAllTrigger}
        unfoldAllTrigger={unfoldAllTrigger}
      />
    </div>
  );
}
