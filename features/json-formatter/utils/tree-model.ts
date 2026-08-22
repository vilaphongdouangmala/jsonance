import type { JsonValue, JsonObject } from "@/features/json-formatter/types/json";

export type JsonNodeType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null";

/**
 * A single node of the parsed JSON, pre-computed once per document.
 *
 * `line` is the node's canonical line in the fully pretty-printed document
 * (`JSON.stringify(data, null, 2)`), 1-based. It is stable regardless of which
 * nodes are collapsed; a collapsed container shows its start line (the line of
 * its opening `{` / `[`).
 */
export interface FlatNode {
  /** Path from root, e.g. ["users", "0", "name"]. Root is []. */
  path: string[];
  /** Stable string key for the expanded-set and React keys. */
  pathKey: string;
  /** Object key or array index (as string). Undefined for the root. */
  keyName?: string;
  value: JsonValue;
  type: JsonNodeType;
  /** Depth from root; root is 0. */
  level: number;
  /** True for object/array. */
  isExpandable: boolean;
  /** Number of properties / elements (0 for primitives). */
  childCount: number;
  /** Canonical 1-based line in the pretty-printed document. */
  line: number;
}

export function getValueType(value: JsonValue): JsonNodeType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  const t = typeof value;
  if (t === "object") return "object";
  return t as JsonNodeType;
}

function childCountOf(value: JsonValue): number {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === "object") {
    return Object.keys(value as JsonObject).length;
  }
  return 0;
}

/**
 * Walk the parsed data once, producing every node in document order with its
 * canonical pretty-printed line number. This mirrors how `JSON.stringify(data,
 * null, 2)` lays out lines:
 *
 *   - the root value starts on line 1;
 *   - each property / element occupies its own line;
 *   - a non-empty container spans from its opening bracket line to a separate
 *     closing bracket line, so its children occupy the lines in between;
 *   - an empty container (`{}` / `[]`) stays on a single line.
 *
 * The returned array is in the order lines appear in the document (a
 * pre-order / opening-line walk), which is exactly the order visible rows
 * should be shown in.
 */
export function buildFlatNodes(root: JsonValue): FlatNode[] {
  const nodes: FlatNode[] = [];
  // `line` tracks the next line to emit; it advances as we descend.
  let line = 1;

  const walk = (
    value: JsonValue,
    path: string[],
    keyName: string | undefined,
    level: number
  ): void => {
    const type = getValueType(value);
    const isExpandable = type === "object" || type === "array";
    const count = childCountOf(value);

    // This node opens on the current line.
    nodes.push({
      path,
      pathKey: path.join("."),
      keyName,
      value,
      type,
      level,
      isExpandable,
      childCount: count,
      line,
    });

    if (!isExpandable || count === 0) {
      // Primitive, or empty container `{}` / `[]`: single line.
      line += 1;
      return;
    }

    // Non-empty container: children occupy the following lines, then a closing
    // bracket occupies its own line.
    line += 1; // move past the opening-bracket line onto the first child line

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        walk(item, [...path, String(index)], String(index), level + 1);
      });
    } else {
      Object.entries(value as JsonObject).forEach(([key, child]) => {
        walk(child, [...path, key], key, level + 1);
      });
    }

    line += 1; // closing-bracket line
  };

  walk(root, [], undefined, 0);
  return nodes;
}

/**
 * From the full node list and the set of expanded path keys, produce the rows
 * that are actually visible (a node is visible iff every ancestor is expanded).
 *
 * Because {@link buildFlatNodes} emits nodes in opening-line order, we can do
 * this in a single linear pass: whenever we hit a collapsed container we skip
 * every node whose path is a descendant of it.
 */
export function getVisibleNodes(
  allNodes: FlatNode[],
  expanded: Set<string>
): FlatNode[] {
  const visible: FlatNode[] = [];
  // Path prefix of the nearest collapsed ancestor we are currently skipping
  // under, or null when not skipping. Stored with a trailing "." so prefix
  // checks don't match sibling keys that merely share a leading substring.
  let skipPrefix: string | null = null;

  for (const node of allNodes) {
    if (skipPrefix !== null) {
      if ((node.pathKey + ".").startsWith(skipPrefix)) {
        // Still inside the collapsed subtree; skip.
        continue;
      }
      // Left the collapsed subtree.
      skipPrefix = null;
    }

    visible.push(node);

    if (node.isExpandable && node.childCount > 0 && !expanded.has(node.pathKey)) {
      // Collapsed: skip its descendants until we exit the subtree.
      skipPrefix = node.pathKey === "" ? "" : node.pathKey + ".";
    }
  }

  return visible;
}

/**
 * Collect the path keys of every expandable, non-empty node — used by
 * "Expand All". Root is included as "".
 */
export function collectExpandablePaths(allNodes: FlatNode[]): string[] {
  const paths: string[] = [];
  for (const node of allNodes) {
    if (node.isExpandable && node.childCount > 0) {
      paths.push(node.pathKey);
    }
  }
  return paths;
}
