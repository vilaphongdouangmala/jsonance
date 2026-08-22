"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export function useJsonFormatter() {
  const t = useTranslations();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatJson = useCallback(() => {
    try {
      if (!jsonInput.trim()) {
        setError(
          t("errors.emptyInput", { action: t("actions.format").toLowerCase() })
        );
        return;
      }

      const parsedJson = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsedJson, null, 2));
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
      setJsonInput(JSON.stringify(parsedJson));
      setError(null);
    } catch (err) {
      console.log((err as Error).message);
      setError(t("errors.invalidJson"));
    }
  }, [jsonInput, t]);

  // Just store the raw text. No per-keystroke parse/stringify: preview parses
  // the current input on its own, and the editor lints on a debounce.
  const handleInputChange = useCallback(
    (value: string) => {
      setJsonInput(value);
      if (error) setError(null);
    },
    [error]
  );

  return {
    jsonInput,
    error,
    formatJson,
    minifyJson,
    handleInputChange,
    setError,
  };
}
