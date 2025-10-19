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
