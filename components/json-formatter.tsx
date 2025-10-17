"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code, Minimize2, Copy, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function JsonFormatter() {
  const t = useTranslations();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      if (!jsonInput.trim()) {
        setError(
          t("errors.emptyInput", { action: t("actions.format").toLowerCase() })
        );
        return;
      }

      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formattedJson);
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
      const minifiedJson = JSON.stringify(parsedJson);
      setJsonInput(minifiedJson);
      setError(null);
    } catch (err) {
      console.log((err as Error).message);
      setError(t("errors.invalidJson"));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
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
              onClick={formatJson}
              title={t("tooltips.format")}
            >
              <Code className="size-4" />
              <span>{t("actions.format")}</span>
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
              onClick={copyToClipboard}
              title={t("tooltips.copy")}
            >
              <Copy className="size-4" />
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
      <Textarea
        value={jsonInput}
        onChange={(e) => {
          setJsonInput(e.target.value);
          if (error) setError(null);
        }}
        placeholder={t("placeholders.jsonInput")}
        className="min-h-[400px] font-mono text-sm"
      />
    </div>
  );
}
