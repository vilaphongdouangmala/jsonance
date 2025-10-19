"use client";

import { Button } from "@/components/ui/button";
import { Code, Minimize2, Copy, Check, Eye, TreePine } from "lucide-react";
import { useTranslations } from "next-intl";

interface ToolbarProps {
  isPreviewMode: boolean;
  isTreeView: boolean;
  copied: boolean;
  onPreviewToggle: () => void;
  onTreeViewToggle: () => void;
  onMinify: () => void;
  onFormat: () => void;
  onCopy: () => void;
}

export function Toolbar({
  isPreviewMode,
  isTreeView,
  copied,
  onPreviewToggle,
  onTreeViewToggle,
  onMinify,
  onFormat,
  onCopy,
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
            <Button
              variant={isTreeView ? "default" : "outline"}
              size="sm"
              onClick={onTreeViewToggle}
              title={t("tooltips.treeView")}
            >
              <TreePine className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
