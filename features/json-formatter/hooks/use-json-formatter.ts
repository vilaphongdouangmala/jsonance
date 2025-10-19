"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export function useJsonFormatter() {
  const t = useTranslations();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formattedJson, setFormattedJson] = useState<string>("");

  const formatJson = useCallback(() => {
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
  }, [jsonInput, t]);

  const minifyJson = useCallback(() => {
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
  }, [jsonInput, t]);

  const handleInputChange = useCallback(
    (value: string) => {
      setJsonInput(value);
      try {
        if (value.trim()) {
          // Try to parse and format for preview mode
          const parsed = JSON.parse(value);
          setFormattedJson(JSON.stringify(parsed, null, 2));
        } else {
          setFormattedJson("");
        }
      } catch {
        // If it's not valid JSON, just use the input as is for preview
        setFormattedJson(value);
      }
      if (error) setError(null);
    },
    [error]
  );

  return {
    jsonInput,
    error,
    formattedJson,
    formatJson,
    minifyJson,
    handleInputChange,
    setError,
  };
}
