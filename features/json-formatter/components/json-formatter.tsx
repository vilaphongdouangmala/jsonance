"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useJsonFormatter } from "@/features/json-formatter/hooks/use-json-formatter";
import { useClipboard } from "@/features/json-formatter/hooks/use-clipboard";
import { useLineNumbers } from "@/features/json-formatter/hooks/use-line-numbers";
import { EditSection } from "@/features/json-formatter/components/edit-section";
import { PreviewSection } from "@/features/json-formatter/components/preview-section";
import { Toolbar } from "@/features/json-formatter/components/toolbar";

export function JsonFormatter() {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isTreeView, setIsTreeView] = useState<boolean>(true);
  const [expandAllTrigger, setExpandAllTrigger] = useState<number>(0);
  const [collapseAllTrigger, setCollapseAllTrigger] = useState<number>(0);

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

  const handleCopy = async (value?: string) => {
    await copyToClipboard(value || jsonInput);
  };

  const handleExpandAll = () => {
    setExpandAllTrigger((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setCollapseAllTrigger((prev) => prev + 1);
  };

  const handleDataChange = (newData: any) => {
    // Convert the updated data back to JSON string and update the input
    try {
      const newJsonString = JSON.stringify(newData, null, 2);
      handleInputChange(newJsonString);
    } catch (error) {
      console.error("Error updating JSON data:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-4">
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
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
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
              expandAllTrigger={expandAllTrigger}
              collapseAllTrigger={collapseAllTrigger}
              onDataChange={handleDataChange}
              isInlineEditEnabled={true}
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
