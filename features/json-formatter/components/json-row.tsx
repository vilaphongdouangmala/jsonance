"use client";

import React, { useCallback, useState } from "react";
import { ChevronRight, ChevronDown, Copy, Edit2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { InlineEditor } from "./inline-editor";
import type { JsonValue } from "@/features/json-formatter/types/json";
import type { FlatNode } from "@/features/json-formatter/utils/tree-model";

interface JsonRowProps {
  node: FlatNode;
  isExpanded: boolean;
  isFocused: boolean;
  onToggle: (pathKey: string, recursive: boolean, expand: boolean) => void;
  onFocus: (pathKey: string) => void;
  onCopy?: (value: string) => Promise<void> | void;
  onValueChange?: (path: string[], newValue: JsonValue) => void;
  isInlineEditEnabled?: boolean;
}

const INDENT_PER_LEVEL = 20;

const getTypeColor = (type: string): string => {
  switch (type) {
    case "string":
      return "text-green-600 dark:text-green-400";
    case "number":
      return "text-blue-600 dark:text-blue-400";
    case "boolean":
      return "text-purple-600 dark:text-purple-400";
    case "null":
      return "text-gray-500 dark:text-gray-400";
    default:
      return "text-foreground";
  }
};

const formatValue = (node: FlatNode): string => {
  switch (node.type) {
    case "null":
      return "null";
    case "boolean":
      return String(node.value);
    case "number":
      return String(node.value);
    case "array":
      return `[] (${node.childCount})`;
    case "object":
      return `{} (${node.childCount})`;
    default:
      return String(node.value ?? "");
  }
};

// A single truncated, one-line rendering of a string value. Long strings are
// cut with an ellipsis (revealed via the row title / copy) so every row stays
// exactly one line high — a hard requirement for smooth virtualization.
const MAX_INLINE_STRING = 200;

const JsonRowComponent: React.FC<JsonRowProps> = ({
  node,
  isExpanded,
  isFocused,
  onToggle,
  onFocus,
  onCopy,
  onValueChange,
  isInlineEditEnabled = false,
}) => {
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);

  const { type, isExpandable, keyName, level, pathKey, path } = node;
  const canEdit = isInlineEditEnabled && !isExpandable;
  const hasKey = keyName !== undefined;

  const flash = useCallback((set: (v: boolean) => void) => {
    set(true);
    setTimeout(() => set(false), 700);
  }, []);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isExpandable) {
        onToggle(pathKey, e.altKey, !isExpanded);
        onFocus(pathKey);
      }
    },
    [isExpandable, onToggle, pathKey, isExpanded, onFocus]
  );

  const handleCopyValue = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const value =
        type === "string"
          ? String(node.value)
          : JSON.stringify(node.value, null, 2);
      if (onCopy) {
        await onCopy(value);
        flash(setCopiedValue);
      }
      onFocus(pathKey);
    },
    [type, node.value, onCopy, flash, pathKey, onFocus]
  );

  const handleCopyKey = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onCopy && hasKey) {
        await onCopy(keyName!);
        flash(setCopiedKey);
      }
      onFocus(pathKey);
    },
    [onCopy, hasKey, keyName, flash, pathKey, onFocus]
  );

  const handleCopyPath = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onCopy) await onCopy(path.join("."));
      onFocus(pathKey);
    },
    [onCopy, path, pathKey, onFocus]
  );

  const handleEdit = useCallback(() => {
    if (canEdit) {
      setIsEditing(true);
      onFocus(pathKey);
    }
  }, [canEdit, pathKey, onFocus]);

  const handleSaveEdit = useCallback(
    (newValue: JsonValue) => {
      onValueChange?.(path, newValue);
      setIsEditing(false);
    },
    [onValueChange, path]
  );

  const handleRowClick = useCallback(() => {
    onFocus(pathKey);
    if (isExpandable) onToggle(pathKey, false, !isExpanded);
  }, [onFocus, pathKey, isExpandable, onToggle, isExpanded]);

  const stringValue = type === "string" ? String(node.value) : "";
  const truncatedString =
    stringValue.length > MAX_INLINE_STRING
      ? `${stringValue.slice(0, MAX_INLINE_STRING)}…`
      : stringValue;

  return (
    <div
      className={cn(
        "flex items-center h-full px-2 hover:bg-muted/50 cursor-pointer group",
        "transition-colors duration-150 focus:outline-none",
        isFocused && "bg-accent"
      )}
      style={{ paddingLeft: `${level * INDENT_PER_LEVEL + 8}px` }}
      onClick={isEditing ? undefined : handleRowClick}
      onDoubleClick={canEdit ? handleEdit : undefined}
      onContextMenu={handleCopyPath}
      role="treeitem"
      aria-expanded={isExpandable ? isExpanded : undefined}
      aria-level={level + 1}
      aria-selected={isFocused}
      title={
        type === "string"
          ? stringValue
          : `${type}${hasKey ? ` — ${path.join(".")}` : ""}`
      }
    >
      {/* Toggle icon */}
      <div className="w-4 h-4 flex items-center justify-center mr-1 shrink-0">
        {isExpandable && node.childCount > 0 && (
          <button
            onClick={handleToggle}
            className="p-0 hover:bg-accent rounded transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Key */}
      {hasKey && (
        <span
          className={cn(
            "text-foreground font-medium mr-1 shrink-0",
            copiedKey && "text-primary"
          )}
          onClick={
            !isExpandable
              ? (e) => {
                  e.stopPropagation();
                  handleCopyKey(e);
                }
              : undefined
          }
        >
          &quot;{keyName}&quot;:
        </span>
      )}

      {/* Value */}
      {isEditing ? (
        <div className="flex-1 mx-2" onClick={(e) => e.stopPropagation()}>
          <InlineEditor
            value={node.value as string | number | boolean | null}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            className="w-full"
          />
        </div>
      ) : type === "string" ? (
        <span className="ml-1 truncate text-green-600 dark:text-green-400 font-mono">
          &quot;{truncatedString}&quot;
        </span>
      ) : (
        <span className={cn("ml-1 font-mono shrink-0", getTypeColor(type))}>
          {formatValue(node)}
        </span>
      )}

      {/* Action buttons (hover) */}
      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {canEdit && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="p-1 hover:bg-accent rounded"
            aria-label={t("actions.editValueAria")}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {hasKey && !isEditing && (
          <button
            onClick={handleCopyKey}
            className="p-1 hover:bg-accent rounded"
            aria-label={t("actions.copyKeyAria", { key: keyName })}
          >
            <Key className="w-4 h-4" />
          </button>
        )}
        {!isEditing && (
          <button
            onClick={handleCopyValue}
            className={cn(
              "p-1 hover:bg-accent rounded",
              copiedValue && "text-primary"
            )}
            aria-label={t("actions.copyValueAria", {
              type: type === "string" ? "value" : "JSON",
            })}
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const JsonRow = React.memo(JsonRowComponent);
