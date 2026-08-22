"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { JsonRow } from "./json-row";
import {
  buildFlatNodes,
  getVisibleNodes,
  collectExpandablePaths,
  type FlatNode,
} from "@/features/json-formatter/utils/tree-model";
import type {
  JsonValue,
  JsonObject,
} from "@/features/json-formatter/types/json";

interface JsonTreeProps {
  data: JsonValue | string;
  className?: string;
  onCopy?: (value: string) => Promise<void> | void;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
  onDataChange?: (newData: JsonValue) => void;
  isInlineEditEnabled?: boolean;
  /** Shared scroll container ref (also used by ScrollToTop). */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

const ROW_HEIGHT = 28; // px; must match the fixed row height below
// Above this many expandable nodes, "Expand All" asks for confirmation before
// materialising a huge visible list.
const EXPAND_ALL_GUARD = 50_000;

export const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  className,
  onCopy,
  expandAllTrigger,
  collapseAllTrigger,
  onDataChange,
  isInlineEditEnabled = false,
  scrollRef: externalScrollRef,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    () => new Set([""])
  );
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = externalScrollRef ?? internalScrollRef;

  const parsedData = useMemo<JsonValue | null>(() => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }, [data]);

  // One walk per document: every node with its canonical line number.
  const allNodes = useMemo<FlatNode[]>(
    () => (parsedData === null ? [] : buildFlatNodes(parsedData)),
    [parsedData]
  );

  // Cheap linear derivation on each expand/collapse.
  const visibleNodes = useMemo(
    () => getVisibleNodes(allNodes, expandedNodes),
    [allNodes, expandedNodes]
  );

  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
    getItemKey: (index) => visibleNodes[index].pathKey || "$root",
  });

  const handleToggle = useCallback(
    (pathKey: string, recursive: boolean, expand: boolean) => {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (!recursive) {
          if (next.has(pathKey)) next.delete(pathKey);
          else next.add(pathKey);
          return next;
        }
        // Alt+click: expand/collapse this node and its whole subtree.
        const prefix = pathKey === "" ? "" : pathKey + ".";
        for (const node of allNodes) {
          const inSubtree =
            node.pathKey === pathKey ||
            (node.pathKey + ".").startsWith(prefix);
          if (inSubtree && node.isExpandable && node.childCount > 0) {
            if (expand) next.add(node.pathKey);
            else next.delete(node.pathKey);
          }
        }
        return next;
      });
    },
    [allNodes]
  );

  const handleFocus = useCallback((pathKey: string) => {
    setFocusedNode(pathKey);
  }, []);

  // Expand all (guarded on very large documents).
  useEffect(() => {
    if (!expandAllTrigger || allNodes.length === 0) return;
    const paths = collectExpandablePaths(allNodes);
    if (
      paths.length > EXPAND_ALL_GUARD &&
      typeof window !== "undefined" &&
      !window.confirm(
        `This will expand ${paths.length.toLocaleString()} nodes and may briefly freeze the page. Continue?`
      )
    ) {
      return;
    }
    setExpandedNodes(new Set(["", ...paths]));
  }, [expandAllTrigger, allNodes]);

  useEffect(() => {
    if (!collapseAllTrigger) return;
    setExpandedNodes(new Set([""]));
  }, [collapseAllTrigger]);

  const handleValueChange = useCallback(
    (path: string[], newValue: JsonValue) => {
      if (!onDataChange || parsedData === null) return;
      const update = (
        obj: JsonValue,
        pathArray: string[],
        value: JsonValue
      ): JsonValue => {
        if (pathArray.length === 0) return value;
        const [head, ...tail] = pathArray;
        if (Array.isArray(obj)) {
          const arr = [...obj];
          const idx = parseInt(head, 10);
          arr[idx] = update(obj[idx], tail, value);
          return arr;
        }
        if (obj && typeof obj === "object") {
          const rec = obj as JsonObject;
          return { ...rec, [head]: update(rec[head], tail, value) };
        }
        return obj;
      };
      onDataChange(update(parsedData, path, newValue));
    },
    [onDataChange, parsedData]
  );

  if (parsedData === null) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Invalid JSON data
      </div>
    );
  }

  const lastLine = allNodes.length ? allNodes[allNodes.length - 1].line : 1;
  const gutterWidth = `${Math.max(2, String(lastLine).length) + 1.5}ch`;
  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={scrollRef}
      className={cn("relative h-full w-full overflow-auto font-mono", className)}
      role="tree"
      aria-label="JSON Tree View"
    >
      <div
        style={{ height: virtualizer.getTotalSize(), position: "relative" }}
      >
        {items.map((item) => {
          const node = visibleNodes[item.index];
          return (
            <div
              key={item.key}
              data-index={item.index}
              className="absolute left-0 top-0 flex w-full"
              style={{
                height: ROW_HEIGHT,
                transform: `translateY(${item.start}px)`,
              }}
            >
              {/* Canonical JSON line number gutter (shares the row => no drift) */}
              <div
                className="shrink-0 select-none border-r bg-muted/40 px-2 text-right text-xs leading-[28px] text-muted-foreground"
                style={{ width: gutterWidth }}
              >
                {node.line}
              </div>
              <div className="min-w-0 flex-1">
                <JsonRow
                  node={node}
                  isExpanded={expandedNodes.has(node.pathKey)}
                  isFocused={focusedNode === node.pathKey}
                  onToggle={handleToggle}
                  onFocus={handleFocus}
                  onCopy={onCopy}
                  onValueChange={handleValueChange}
                  isInlineEditEnabled={isInlineEditEnabled}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
