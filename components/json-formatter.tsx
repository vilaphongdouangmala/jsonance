"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useJsonFormatter } from "@/hooks/use-json-formatter";
import { useClipboard } from "@/hooks/use-clipboard";
import { useLineNumbers } from "@/hooks/use-line-numbers";
import { Toolbar } from "./json-formatter/toolbar";
import { PreviewSection } from "./json-formatter/preview-section";
import { EditSection } from "./json-formatter/edit-section";

export function JsonFormatter() {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isTreeView, setIsTreeView] = useState<boolean>(false);

  const {
    jsonInput,
    error,
    formattedJson,
    formatJson,
    minifyJson,
    handleInputChange,
  } = useJsonFormatter();

  const { copied, copyToClipboard } = useClipboard();

  const {
    lineCount,
    currentLine,
    textareaRef,
    lineNumbersRef,
    previewLineNumbersRef,
    syntaxHighlighterRef,
  } = useLineNumbers(jsonInput, isPreviewMode);

  const handleCopy = (value?: string) => {
    copyToClipboard(value || jsonInput);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Toolbar
          isPreviewMode={isPreviewMode}
          isTreeView={isTreeView}
          copied={copied}
          onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
          onTreeViewToggle={() => setIsTreeView(!isTreeView)}
          onMinify={minifyJson}
          onFormat={formatJson}
          onCopy={() => handleCopy()}
        />
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
            <AlertCircle className="size-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="relative flex font-mono text-sm border rounded-md overflow-hidden">
        {isPreviewMode ? (
          <div className="w-full flex">
            <PreviewSection
              isTreeView={isTreeView}
              jsonInput={jsonInput}
              formattedJson={formattedJson}
              previewLineNumbersRef={previewLineNumbersRef}
              syntaxHighlighterRef={syntaxHighlighterRef}
              onCopy={handleCopy}
            />
          </div>
        ) : (
          <EditSection
            jsonInput={jsonInput}
            lineCount={lineCount}
            currentLine={currentLine}
            textareaRef={textareaRef}
            lineNumbersRef={lineNumbersRef}
            onInputChange={handleInputChange}
          />
        )}
      </div>
    </div>
  );
}
