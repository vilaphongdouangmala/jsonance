"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Link,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  analyzeString,
  getStringTypeDescription,
  STRING_THRESHOLDS,
} from "../utils/string-detection";
import Image from "next/image";

interface TruncatedStringProps {
  value: string;
  maxLength?: number;
  className?: string;
  onCopy?: (value: string) => Promise<void> | void;
  showMetadata?: boolean;
}

interface Base64ImagePreviewProps {
  src: string;
  format: string;
  size: string;
}

const Base64ImagePreview: React.FC<Base64ImagePreviewProps> = ({
  src,
  format,
  size,
}) => {
  const [imageError, setImageError] = useState(false);
  const t = useTranslations();

  if (imageError) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm text-muted-foreground">
        <ImageIcon className="w-4 h-4" />
        <span>{t("truncatedString.invalidImageData", { format, size })}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2"></div>
      {
        <div className="p-2 bg-muted rounded">
          <Image
            src={src}
            alt={t("truncatedString.base64ImageAlt", { format })}
            className="max-w-full max-h-48 object-contain rounded border"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      }
    </div>
  );
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "base64-image":
      return <ImageIcon className="w-3 h-3" />;
    case "url":
      return <Link className="w-3 h-3" />;
    case "json":
    case "xml":
      return <Code className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
  }
};

export const TruncatedString: React.FC<TruncatedStringProps> = ({
  value,
  maxLength = STRING_THRESHOLDS.SHORT,
  className,
  showMetadata = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const t = useTranslations();

  const analysis = useMemo(() => analyzeString(value), [value]);

  const displayValue = useMemo(() => {
    if (!analysis.shouldTruncate || isExpanded) {
      return value;
    }

    const truncatedLength = Math.min(maxLength, STRING_THRESHOLDS.MEDIUM);
    return value.length > truncatedLength
      ? `${value.substring(0, truncatedLength)}...`
      : value;
  }, [value, analysis.shouldTruncate, isExpanded, maxLength]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleTogglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  const renderStringContent = () => {
    return (
      <span className="font-mono text-sm break-all">&quot;{displayValue}&quot;</span>
    );
  };

  const renderMetadata = () => {
    if (!showMetadata || !analysis.shouldTruncate) return null;

    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
          {getTypeIcon(analysis.type)}
          <span>{getStringTypeDescription(analysis, t)}</span>
        </div>

        {analysis.shouldTruncate && (
          <button
            onClick={handleToggleExpand}
            className="flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>{t("truncatedString.collapse")}</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3" />
                <span>{t("truncatedString.expand")}</span>
              </>
            )}
          </button>
        )}

        {analysis.type === "base64-image" && (
          <button
            onClick={handleTogglePreview}
            className="flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ImageIcon className="w-3 h-3" />
            <span>
              {showPreview
                ? t("truncatedString.hide")
                : t("truncatedString.preview")}
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-1", className)}>
      {renderMetadata()}
      {renderStringContent()}

      {/* Base64 Image Preview */}
      {analysis.type === "base64-image" && showPreview && analysis.metadata && (
        <Base64ImagePreview
          src={value}
          format={analysis.metadata.imageFormat || "unknown"}
          size={analysis.metadata.estimatedSize || "unknown"}
        />
      )}
    </div>
  );
};
