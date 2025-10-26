"use client";

import { Button } from "@/components/ui/button";
import {
  Code,
  Minimize2,
  Copy,
  Check,
  Eye,
  Expand,
  Shrink,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ToolbarProps {
  isPreviewMode: boolean;
  copied: boolean;
  onPreviewToggle: () => void;
  onMinify: () => void;
  onFormat: () => void;
  onCopy: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
}

export function Toolbar({
  isPreviewMode,
  copied,
  onPreviewToggle,
  onMinify,
  onFormat,
  onCopy,
  onExpandAll,
  onCollapseAll,
}: ToolbarProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col justify-end gap-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={onPreviewToggle}
            title={t("tooltips.preview")}
          >
            <Eye className="size-4" />
            <span>{t("tooltips.preview")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onMinify}
            title={t("tooltips.minify")}
          >
            <Minimize2 className="size-4" />
            <span>{t("actions.minify")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFormat}
            title={t("tooltips.format")}
          >
            <Code className="size-4" />
            <span>{t("actions.format")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            title={t("tooltips.copy")}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            <span>{t("actions.copy")}</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex gap-1">
          {isPreviewMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                title={t("tooltips.collapseAll")}
                onClick={onCollapseAll}
              >
                <Shrink className="size-4" />
                <span>{t("tooltips.collapseAll")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                title={t("tooltips.expandAll")}
                onClick={onExpandAll}
              >
                <Expand className="size-4" />
                <span>{t("tooltips.expandAll")}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
