# Context — jsonance JSON tool

Glossary of the ubiquitous language for the JSON formatter/previewer. Terms only; no implementation detail.

## Modes

- **Edit mode** — the raw-text editing surface. The user types/pastes JSON here. Owns the *editor gutter*.
- **Preview mode** — the interactive, collapsible *tree* rendering of parsed JSON. Owns the *tree gutter*.

These are mutually exclusive views of the same document, toggled from the toolbar.

## Editor

- **Editor** — the code-editing component behind Edit mode (CodeMirror 6). Provides syntax highlighting, an inline parse-error marker, and a native, virtualized line-number gutter.
- **Editor gutter** — the line-number column that is part of the editor and scrolls natively with the text. It cannot drift from the text (single scroll container), unlike the previous two-element scroll-synced gutter.
- **Inline error marker** — the in-editor indication of a JSON parse error at the offending line, computed on a debounced parse (not per keystroke).

## Tree

- **Node** — one key/value (or array element) in the parsed JSON. May be *expandable* (object/array) or a *leaf* (primitive).
- **Visible row** — a node whose every ancestor is expanded, i.e. currently on screen in the tree. The tree renders only the visible rows in the viewport (virtualized).
- **Flattened visible list** — the ordered list of visible rows derived from the parsed data + the expanded set. The unit the virtualizer iterates.
- **Expanded set** — the set of node paths currently expanded. Drives which nodes become visible rows.
- **Canonical JSON line** — the line number a node would occupy in the fully pretty-printed (`stringify(data, null, 2)`) document. This is the *stable* number shown in the tree gutter; it matches the editor's line numbers for the same node. A collapsed container shows its **start line** (the line of its opening `{`/`[`).
- **Tree gutter** — the line-number column beside the tree, showing each visible row's canonical JSON line. Goes non-contiguous when nodes are collapsed (by design: the numbers stay true to the JSON, not to screen position).

## Notes

- **Row** in the tree is fixed-height (one line). Long string values truncate; they do not grow the row.
