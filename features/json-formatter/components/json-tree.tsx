"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { JsonNode } from "./json-node";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonTreeProps {
  data: JsonValue | string;
  className?: string;
  onCopy?: (value: string) => Promise<void> | void;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
  onDataChange?: (newData: JsonValue) => void;
  isInlineEditEnabled?: boolean;
}

interface TreeState {
  expandedNodes: Set<string>;
  focusedNode: string | null;
}

export const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  className,
  onCopy,
  expandAllTrigger,
  collapseAllTrigger,
  onDataChange,
  isInlineEditEnabled = false,
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

  const parsedData = useMemo(() => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }, [data]);

  // Function to collect all expandable paths
  const collectAllPaths = useCallback(
    (obj: JsonValue, currentPath: string[] = []): string[] => {
      const paths: string[] = [];

      if (typeof obj === "object" && obj !== null) {
        const pathKey = currentPath.join(".");
        if (pathKey !== "") paths.push(pathKey);

        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            const newPath = [...currentPath, index.toString()];
            paths.push(...collectAllPaths(item, newPath));
          });
        } else {
          Object.entries(obj as JsonObject).forEach(([key, value]) => {
            const newPath = [...currentPath, key];
            paths.push(...collectAllPaths(value, newPath));
          });
        }
      }

      return paths;
    },
    []
  );

  // Handle expand all trigger
  useEffect(() => {
    if (expandAllTrigger && parsedData) {
      const allPaths = collectAllPaths(parsedData);
      setTreeState((prev) => ({
        ...prev,
        expandedNodes: new Set(["", ...allPaths]),
      }));
    }
  }, [expandAllTrigger, parsedData, collectAllPaths]);

  // Handle collapse all trigger
  useEffect(() => {
    if (collapseAllTrigger) {
      setTreeState((prev) => ({
        ...prev,
        expandedNodes: new Set([""]),
      }));
    }
  }, [collapseAllTrigger]);

  // Handle value changes from inline editing
  const handleValueChange = useCallback(
    (path: string[], newValue: JsonValue) => {
      if (!onDataChange || !parsedData) return;

      // Create a deep copy of the data and update the specific path
      const updateNestedValue = (
        obj: any,
        pathArray: string[],
        value: JsonValue
      ): any => {
        if (pathArray.length === 0) {
          return value;
        }

        const [head, ...tail] = pathArray;
        if (Array.isArray(obj)) {
          const newArray = [...obj];
          const index = parseInt(head, 10);
          newArray[index] = updateNestedValue(obj[index], tail, value);
          return newArray;
        } else {
          const newObj = { ...obj };
          newObj[head] = updateNestedValue(obj[head], tail, value);
          return newObj;
        }
      };

      const updatedData = updateNestedValue(parsedData, path, newValue);
      onDataChange(updatedData);
    },
    [onDataChange, parsedData]
  );

  // Keyboard navigation for the container
  const handleContainerKeyDown = useCallback(() => {
    // Focus management will be handled by individual nodes
  }, []);

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
      className={cn("font-mono text-sm", className)}
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
        onValueChange={handleValueChange}
        isInlineEditEnabled={isInlineEditEnabled}
      />
    </div>
  );
};
