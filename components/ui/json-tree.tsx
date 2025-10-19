"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ChevronRight, ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonTreeProps {
  data: JsonValue | string;
  className?: string;
  onCopy?: (value: string) => void;
}

interface TreeState {
  expandedNodes: Set<string>;
  focusedNode: string | null;
}

interface JsonNodeProps {
  data: JsonValue;
  keyName?: string;
  level: number;
  path: string[];
  expandedNodes: Set<string>;
  focusedNode: string | null;
  onToggle: (path: string) => void;
  onFocus: (path: string) => void;
  onCopy?: (value: string) => void;
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
    case "string":
      return `"${value}"`;
    case "null":
      return "null";
    case "boolean":
      return value?.toString() ?? "false";
    case "number":
      return value?.toString() ?? "0";
    case "array":
      return `Array(${Array.isArray(value) ? value.length : 0})`;
    case "object":
      return `Object(${
        value && typeof value === "object" && !Array.isArray(value)
          ? Object.keys(value).length
          : 0
      })`;
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

const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  keyName,
  level,
  path,
  expandedNodes,
  focusedNode,
  onToggle,
  onFocus,
  onCopy,
}) => {
  const type = getValueType(data);
  const isExpandable = type === "object" || type === "array";
  const pathKey = path.join(".");
  const isExpanded = expandedNodes.has(pathKey);
  const isFocused = focusedNode === pathKey;
  const indentSize = level * 20;
  const nodeRef = useRef<HTMLDivElement>(null);

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
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const value =
        type === "string" ? String(data) : JSON.stringify(data, null, 2);
      onCopy?.(value);
      onFocus(pathKey);
    },
    [data, type, onCopy, pathKey, onFocus]
  );

  const handleKeyboardCopy = useCallback(() => {
    const value =
      type === "string" ? String(data) : JSON.stringify(data, null, 2);
    onCopy?.(value);
    onFocus(pathKey);
  }, [data, type, onCopy, pathKey, onFocus]);

  const handleCopyPath = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pathString = path.join(".");
      onCopy?.(pathString);
      onFocus(pathKey);
    },
    [path, onCopy, pathKey, onFocus]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isExpandable) {
            onToggle(pathKey);
          } else {
            handleKeyboardCopy();
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
    [isExpandable, isExpanded, pathKey, onToggle, handleKeyboardCopy]
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
      />
    ));
  };

  return (
    <div className="select-none">
      <div
        ref={nodeRef}
        className={cn(
          "flex items-center py-1 px-2 hover:bg-muted/50 cursor-pointer group",
          "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary",
          isFocused && "bg-accent"
        )}
        style={{ paddingLeft: `${indentSize + 8}px` }}
        onClick={isExpandable ? handleToggle : handleCopyValue}
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
          <span className="text-foreground font-medium mr-1">
            &quot;{keyName}&quot;:
          </span>
        )}

        {/* Value */}
        <span className={cn("font-mono text-sm", getTypeColor(type))}>
          {formatValue(data, type)}
        </span>

        {/* Type badge for non-expandable items */}
        {!isExpandable && (
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {type}
          </span>
        )}

        {/* Copy button (visible on hover) */}
        <button
          onClick={handleCopyValue}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
          title={`Copy ${type === "string" ? "value" : "JSON"}`}
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>

      {/* Children */}
      {renderChildren()}
    </div>
  );
};

export const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  className,
  onCopy,
}) => {
  const [treeState, setTreeState] = useState<TreeState>({
    expandedNodes: new Set([""]),
    focusedNode: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback((path: string) => {
    setTreeState((prev) => {
      const newExpandedNodes = new Set(prev.expandedNodes);
      if (newExpandedNodes.has(path)) {
        newExpandedNodes.delete(path);
      } else {
        newExpandedNodes.add(path);
      }
      return {
        ...prev,
        expandedNodes: newExpandedNodes,
      };
    });
  }, []);

  const handleFocus = useCallback((path: string) => {
    setTreeState((prev) => ({
      ...prev,
      focusedNode: path,
    }));
  }, []);

  // Keyboard navigation for the container
  const handleContainerKeyDown = useCallback(() => {
    // Focus management will be handled by individual nodes
  }, []);

  const parsedData = useMemo(() => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }, [data]);

  if (!parsedData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Invalid JSON data
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("font-mono text-sm overflow-auto", className)}
      onKeyDown={handleContainerKeyDown}
      role="tree"
      aria-label="JSON Tree View"
    >
      <JsonNode
        data={parsedData}
        level={0}
        path={[]}
        expandedNodes={treeState.expandedNodes}
        focusedNode={treeState.focusedNode}
        onToggle={handleToggle}
        onFocus={handleFocus}
        onCopy={onCopy}
      />
    </div>
  );
};
