"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronDown, Copy, Edit2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { InlineEditor } from "./inline-editor";
import { TruncatedString } from "./truncated-string";
import type {
  JsonValue,
  JsonObject,
} from "@/features/json-formatter/types/json";

interface JsonNodeProps {
  data: JsonValue;
  keyName?: string;
  level: number;
  path: string[];
  expandedNodes: Set<string>;
  focusedNode: string | null;
  onToggle: (path: string) => void;
  onFocus: (path: string) => void;
  onCopy?: (value: string) => Promise<void> | void;
  onValueChange?: (path: string[], newValue: JsonValue) => void;
  isInlineEditEnabled?: boolean;
}

// Type checking utilities
const getValueType = (value: JsonValue): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

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

const formatValue = (value: JsonValue, type: string): string => {
  switch (type) {
    case "null":
      return "null";
    case "boolean":
      return value?.toString() ?? "false";
    case "number":
      return value?.toString() ?? "0";
    case "array":
      return `[] (${Array.isArray(value) ? value.length : 0})`;
    case "object":
      return `{}`;
    default:
      return String(value ?? "");
  }
};

const getTooltipText = (
  value: JsonValue,
  type: string,
  path: string[]
): string => {
  const pathStr = path.length > 0 ? path.join(".") : "root";
  switch (type) {
    case "string":
      return `String (${
        typeof value === "string" ? value.length : 0
      } chars) - Path: ${pathStr}`;
    case "number":
      return `Number - Path: ${pathStr}`;
    case "boolean":
      return `Boolean - Path: ${pathStr}`;
    case "null":
      return `Null - Path: ${pathStr}`;
    case "array":
      return `Array (${
        Array.isArray(value) ? value.length : 0
      } items) - Path: ${pathStr}`;
    case "object":
      return `Object (${
        value && typeof value === "object" && !Array.isArray(value)
          ? Object.keys(value).length
          : 0
      } properties) - Path: ${pathStr}`;
    default:
      return `${type} - Path: ${pathStr}`;
  }
};

export const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  keyName,
  level,
  path,
  expandedNodes,
  focusedNode,
  onToggle,
  onFocus,
  onCopy,
  onValueChange,
  isInlineEditEnabled = false,
}) => {
  const type = getValueType(data);
  const isExpandable = type === "object" || type === "array";
  const pathKey = path.join(".");
  const isExpanded = expandedNodes.has(pathKey);
  const isFocused = focusedNode === pathKey;
  const indentSize = level * 20;
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const t = useTranslations();

  const canEdit = isInlineEditEnabled && !isExpandable;
  const hasKey = keyName !== undefined;

  // Auto-scroll to focused node
  useEffect(() => {
    if (isFocused && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isFocused]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.altKey) {
        // Alt+Click: recursively expand/collapse
        const toggleRecursively = (
          obj: JsonValue,
          currentPath: string[],
          shouldExpand: boolean
        ) => {
          const currentPathKey = currentPath.join(".");
          if (shouldExpand) {
            expandedNodes.add(currentPathKey);
          } else {
            expandedNodes.delete(currentPathKey);
          }

          if (typeof obj === "object" && obj !== null) {
            if (Array.isArray(obj)) {
              obj.forEach((item, index) => {
                const newPath = [...currentPath, index.toString()];
                if (typeof item === "object" && item !== null) {
                  toggleRecursively(item, newPath, shouldExpand);
                }
              });
            } else {
              Object.entries(obj as JsonObject).forEach(([key, value]) => {
                const newPath = [...currentPath, key];
                if (typeof value === "object" && value !== null) {
                  toggleRecursively(value, newPath, shouldExpand);
                }
              });
            }
          }
        };

        toggleRecursively(data, path, !isExpanded);
      }
      onToggle(pathKey);
      onFocus(pathKey);
    },
    [data, path, pathKey, isExpanded, expandedNodes, onToggle, onFocus]
  );

  const handleCopyValue = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const value =
        type === "string" ? String(data) : JSON.stringify(data, null, 2);
      if (onCopy) {
        await onCopy(value);
      }
      onFocus(pathKey);
    },
    [data, type, onCopy, pathKey, onFocus]
  );

  const handleKeyboardCopy = useCallback(async () => {
    const value =
      type === "string" ? String(data) : JSON.stringify(data, null, 2);
    if (onCopy) {
      await onCopy(value);
    }
    onFocus(pathKey);
  }, [data, type, onCopy, pathKey, onFocus]);

  const handleCopyPath = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pathString = path.join(".");
      if (onCopy) {
        await onCopy(pathString);
      }
      onFocus(pathKey);
    },
    [path, onCopy, pathKey, onFocus]
  );

  const handleCopyKey = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onCopy && hasKey) {
        await onCopy(keyName!);
      }
      onFocus(pathKey);
    },
    [onCopy, keyName, hasKey, pathKey, onFocus]
  );

  const handleKeyboardCopyKey = useCallback(async () => {
    if (onCopy && hasKey) {
      await onCopy(keyName!);
    }
    onFocus(pathKey);
  }, [onCopy, keyName, hasKey, pathKey, onFocus]);

  const handleEdit = useCallback(() => {
    if (canEdit) {
      setIsEditing(true);
      onFocus(pathKey);
    }
  }, [canEdit, pathKey, onFocus]);

  const handleSaveEdit = useCallback(
    (newValue: JsonValue) => {
      if (onValueChange) {
        onValueChange(path, newValue);
      }
      setIsEditing(false);
    },
    [onValueChange, path]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing) return; // Don't handle keys when editing

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isExpandable) {
            onToggle(pathKey);
          } else if (canEdit) {
            handleEdit();
          } else {
            handleKeyboardCopy();
          }
          break;
        case "k":
        case "K":
          if (hasKey) {
            e.preventDefault();
            handleKeyboardCopyKey();
          }
          break;
        case "F2":
          if (canEdit) {
            e.preventDefault();
            handleEdit();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (isExpandable && !isExpanded) {
            onToggle(pathKey);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (isExpandable && isExpanded) {
            onToggle(pathKey);
          }
          break;
      }
    },
    [
      isEditing,
      isExpandable,
      isExpanded,
      pathKey,
      onToggle,
      handleKeyboardCopy,
      handleKeyboardCopyKey,
      canEdit,
      handleEdit,
      hasKey,
    ]
  );

  const renderChildren = () => {
    if (!isExpandable || !isExpanded) return null;

    if (type === "array" && Array.isArray(data)) {
      return data.map((item: JsonValue, index: number) => (
        <JsonNode
          key={index}
          data={item}
          keyName={index.toString()}
          level={level + 1}
          path={[...path, index.toString()]}
          expandedNodes={expandedNodes}
          focusedNode={focusedNode}
          onToggle={onToggle}
          onFocus={onFocus}
          onCopy={onCopy}
          onValueChange={onValueChange}
          isInlineEditEnabled={isInlineEditEnabled}
        />
      ));
    }

    return Object.entries(data as JsonObject).map(([key, value]) => (
      <JsonNode
        key={key}
        data={value}
        keyName={key}
        level={level + 1}
        path={[...path, key]}
        expandedNodes={expandedNodes}
        focusedNode={focusedNode}
        onToggle={onToggle}
        onFocus={onFocus}
        onCopy={onCopy}
        onValueChange={onValueChange}
        isInlineEditEnabled={isInlineEditEnabled}
      />
    ));
  };

  return (
    <div className="select-none">
      <div
        ref={nodeRef}
        className={cn(
          "flex items-center py-1 px-2 hover:bg-muted/50 cursor-pointer group",
          "transition-colors duration-150 focus:outline-none",
          isFocused && "bg-accent"
        )}
        style={{ paddingLeft: `${indentSize + 8}px` }}
        onClick={isExpandable ? handleToggle : undefined}
        onDoubleClick={canEdit && !isExpandable ? handleEdit : undefined}
        onContextMenu={handleCopyPath}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="treeitem"
        aria-expanded={isExpandable ? isExpanded : undefined}
        aria-level={level + 1}
        aria-selected={isFocused}
        title={getTooltipText(data, type, path)}
      >
        {/* Toggle icon */}
        <div className="w-4 h-4 flex items-center justify-center mr-1">
          {isExpandable && (
            <button
              onClick={handleToggle}
              className="p-0 hover:bg-accent rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Key name */}
        {keyName && (
          <span
            className={cn(
              "text-foreground font-medium mr-1",
              !isExpandable &&
                "cursor-pointer hover:bg-accent rounded px-1 -mx-1 transition-colors"
            )}
            onClick={!isExpandable ? handleCopyKey : undefined}
            title={!isExpandable ? t("tooltips.copyKey") : undefined}
          >
            &quot;{keyName}&quot;:
          </span>
        )}

        {/* Value */}
        {isEditing ? (
          <div className="flex-1 mr-2">
            <InlineEditor
              value={data as string | number | boolean | null}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              className="w-full"
            />
          </div>
        ) : type === "string" ? (
          <div className="flex-1">
            <TruncatedString
              value={String(data)}
              onCopy={(value) => onCopy?.(value)}
              showMetadata={true}
            />
          </div>
        ) : (
          <span className={cn("font-mono text-sm", getTypeColor(type))}>
            {formatValue(data, type)}
          </span>
        )}

        {/* Type badge for non-expandable items */}
        {!isExpandable && (
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {type}
          </span>
        )}

        {/* Action buttons (visible on hover) */}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && !isEditing && (
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-accent rounded"
              title={t("tooltips.edit")}
              aria-label={t("actions.editValueAria")}
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          {hasKey && !isEditing && (
            <button
              onClick={handleCopyKey}
              className="p-1 hover:bg-accent rounded"
              title={t("tooltips.copyKey")}
              aria-label={t("actions.copyKeyAria", { key: keyName })}
            >
              <Key className="w-3 h-3" />
            </button>
          )}
          {!isEditing && (
            <button
              onClick={handleCopyValue}
              className="p-1 hover:bg-accent rounded"
              title={t("tooltips.copyValue")}
              aria-label={t("actions.copyValueAria", {
                type: type === "string" ? "value" : "JSON",
              })}
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {renderChildren()}
    </div>
  );
};
