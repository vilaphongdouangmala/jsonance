"use client";

import { CodeEditor } from "./code-editor";
import { useTranslations } from "next-intl";

interface EditSectionProps {
  jsonInput: string;
  onInputChange: (value: string) => void;
}

export function EditSection({ jsonInput, onInputChange }: EditSectionProps) {
  const t = useTranslations();

  return (
    <div className="h-[65vh] min-h-[300px] w-full">
      <CodeEditor
        value={jsonInput}
        onChange={onInputChange}
        placeholder={t("placeholders.jsonInput")}
      />
    </div>
  );
}
