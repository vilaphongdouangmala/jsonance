"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code, Minimize2, Copy, AlertCircle, Check, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SyntaxHighlighter } from "./syntax-highlighter";
import { LineNumbers } from "@/components/ui/line-numbers";

export function JsonFormatter() {
  const t = useTranslations();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [lineCount, setLineCount] = useState<number>(1);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [formattedJson, setFormattedJson] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Update line numbers when input changes and sync scroll
  useEffect(() => {
    const lines = jsonInput.split("\n").length;
    setLineCount(lines);

    // Sync scroll position between textarea and line numbers
    const syncScroll = () => {
      if (lineNumbersRef.current && textareaRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    };

    // Get current cursor position line
    const updateCurrentLine = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = jsonInput.substring(0, cursorPosition);
        const line = textBeforeCursor.split("\n").length;
        setCurrentLine(line);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("scroll", syncScroll);
      textarea.addEventListener("click", updateCurrentLine);
      textarea.addEventListener("keyup", updateCurrentLine);

      return () => {
        textarea.removeEventListener("scroll", syncScroll);
        textarea.removeEventListener("click", updateCurrentLine);
        textarea.removeEventListener("keyup", updateCurrentLine);
      };
    }
  }, [jsonInput]);

  const formatJson = () => {
    try {
      if (!jsonInput.trim()) {
        setError(
          t("errors.emptyInput", { action: t("actions.format").toLowerCase() })
        );
        return;
      }

      const parsedJson = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formatted);
      setFormattedJson(formatted);
      setError(null);
    } catch (err) {
      console.log((err as Error).message);
      setError(t("errors.invalidJson"));
    }
  };

  const minifyJson = () => {
    try {
      if (!jsonInput.trim()) {
        setError(
          t("errors.emptyInput", { action: t("actions.minify").toLowerCase() })
        );
        return;
      }

      const parsedJson = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsedJson);
      setJsonInput(minified);
      setFormattedJson(minified);
      setError(null);
    } catch (err) {
      console.log((err as Error).message);
      setError(t("errors.invalidJson"));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("app.title")}</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              title={isPreviewMode ? "Edit mode" : "Preview mode"}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={minifyJson}
              title={t("tooltips.minify")}
            >
              <Minimize2 className="size-4" />
              <span>{t("actions.minify")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={formatJson}
              title={t("tooltips.format")}
            >
              <Code className="size-4" />
              <span>{t("actions.format")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              title={t("tooltips.copy")}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
            <AlertCircle className="size-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="relative flex font-mono text-sm border rounded-md overflow-hidden">
        {/* Preview mode with syntax highlighting */}
        {isPreviewMode ? (
          <div className="w-full overflow-auto">
            {(formattedJson || jsonInput).trim() ? (
              <SyntaxHighlighter
                code={formattedJson || jsonInput}
                language="json"
                className="min-h-[400px] p-4 m-0 overflow-auto"
              />
            ) : (
              <div className="min-h-[400px] p-4 flex items-center justify-center text-muted-foreground">
                {t("placeholders.jsonInput")}
              </div>
            )}
          </div>
        ) : (
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
              onChange={(e) => {
                const newValue = e.target.value;
                setJsonInput(newValue);
                try {
                  if (newValue.trim()) {
                    // Try to parse and format for preview mode
                    const parsed = JSON.parse(newValue);
                    setFormattedJson(JSON.stringify(parsed, null, 2));
                  } else {
                    setFormattedJson("");
                  }
                } catch (err) {
                  // If it's not valid JSON, just use the input as is for preview
                  setFormattedJson(newValue);
                }
                if (error) setError(null);
              }}
              placeholder={t("placeholders.jsonInput")}
              className={cn(
                "min-h-[400px] font-mono text-sm flex-1",
                "resize-none overflow-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                "rounded-none py-2"
              )}
              style={{ lineHeight: "1.5rem" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
