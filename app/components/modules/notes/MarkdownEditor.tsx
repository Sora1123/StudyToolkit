"use client";

import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { EditorState, RangeSetBuilder, Extension } from "@codemirror/state";
import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Decoration,
  DecorationSet,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { history, historyKeymap, defaultKeymap } from "@codemirror/commands";
import {
  syntaxTree,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { tags as t } from "@lezer/highlight";
import { LatexExpression } from "@latex-math/react";

/**
 * A true in-place Markdown editor (CodeMirror 6) with live "WYSIWYG-ish"
 * preview: markdown formatting is styled inline, syntax markers (**, #, `, etc.)
 * are hidden unless the caret is on that line, and inline `$…$` / block `$$…$$`
 * math is rendered as KaTeX widgets. Plain-text Markdown remains the source of
 * truth — no separate preview pane.
 *
 * This is a client-only component (CodeMirror touches the DOM); NotesModule
 * loads it via a dynamic import with ssr:false.
 */

// --- Math widget: mounts the shared LatexExpression (KaTeX) renderer --------

class MathWidget extends WidgetType {
  private root: Root | null = null;
  constructor(
    readonly expr: string,
    readonly display: boolean,
  ) {
    super();
  }
  eq(other: MathWidget) {
    return other.expr === this.expr && other.display === this.display;
  }
  toDOM() {
    const wrap = document.createElement("span");
    wrap.className = this.display ? "cm-math cm-math-display" : "cm-math";
    // Render the shared React LaTeX component into the widget DOM.
    this.root = createRoot(wrap);
    this.root.render(
      <LatexExpression
        expression={this.expr}
        displayMode={this.display}
        output="html"
      />,
    );
    return wrap;
  }
  destroy() {
    // Defer unmount to avoid React "unmount during render" warnings.
    const r = this.root;
    this.root = null;
    if (r) setTimeout(() => r.unmount(), 0);
  }
  ignoreEvent() {
    return false;
  }
}

// --- Live preview plugin ----------------------------------------------------

/** True when the selection/caret overlaps [from,to] — then we reveal markers. */
function selectionTouches(view: EditorView, from: number, to: number): boolean {
  for (const r of view.state.selection.ranges) {
    if (r.from <= to && r.to >= from) return true;
  }
  return false;
}

const hiddenMark = Decoration.replace({});

/** Lezer node names for markdown syntax markers we hide in preview. */
const MARKER_NODES = new Set([
  "HeaderMark",
  "EmphasisMark",
  "StrongEmphasisMark",
  "StrikethroughMark",
  "CodeMark",
  "QuoteMark",
  "LinkMark",
  "ListMark",
]);

function buildDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const doc = state.doc;

  // Collect all decorations first, then sort + build (RangeSetBuilder requires
  // ascending order and we mix tree-based marker hiding with regex math).
  const decos: { from: number; to: number; deco: Decoration }[] = [];

  // 1) Hide markdown markers (##, **, `, >, -, link brackets) unless the caret
  //    is on that marker's line — classic live-preview behavior.
  const tree = syntaxTree(state);
  for (const { from, to } of view.visibleRanges) {
    tree.iterate({
      from,
      to,
      enter: (node) => {
        if (!MARKER_NODES.has(node.name)) return;
        if (node.to === node.from) return;
        if (selectionTouches(view, node.from, node.to)) return;
        // Keep a trailing space after list/quote markers readable by only
        // hiding the marker glyphs themselves.
        decos.push({ from: node.from, to: node.to, deco: hiddenMark });
      },
    });
  }

  // 2) Math rendering (regex-based; the markdown grammar doesn't parse TeX).
  const text = doc.toString();

  // Block math: $$ ... $$ (possibly multiline)
  const blockRe = /\$\$([\s\S]+?)\$\$/g;
  const blockRanges: [number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(text))) {
    const s = m.index;
    const e = m.index + m[0].length;
    blockRanges.push([s, e]);
    if (!selectionTouches(view, s, e)) {
      decos.push({
        from: s,
        to: e,
        deco: Decoration.replace({
          widget: new MathWidget(m[1].trim(), true),
          block: false,
        }),
      });
    }
  }

  // Inline math: $ ... $ (single line, not overlapping block math)
  const inlineRe = /\$([^\n$]+?)\$/g;
  while ((m = inlineRe.exec(text))) {
    const s = m.index;
    const e = m.index + m[0].length;
    if (blockRanges.some(([bs, be]) => s >= bs && e <= be)) continue;
    if (!selectionTouches(view, s, e)) {
      decos.push({
        from: s,
        to: e,
        deco: Decoration.replace({
          widget: new MathWidget(m[1].trim(), false),
        }),
      });
    }
  }

  // Sort and drop any overlapping ranges (RangeSetBuilder requires strictly
  // non-overlapping, ascending ranges). Marker-hiding and math can overlap in
  // pathological input; when they do, the earlier-starting one wins.
  decos.sort((a, b) => a.from - b.from || a.to - b.to);
  const builder = new RangeSetBuilder<Decoration>();
  let lastTo = -1;
  for (const d of decos) {
    if (d.from < lastTo) continue; // skip overlap
    if (d.to < d.from) continue;
    builder.add(d.from, d.to, d.deco);
    lastTo = d.to;
  }
  return builder.finish();
}

const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.selectionSet || u.viewportChanged) {
        this.decorations = buildDecorations(u.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

// --- Inline styling of markdown via highlight tags --------------------------

const mdHighlight = HighlightStyle.define([
  { tag: t.heading1, fontSize: "1.5em", fontWeight: "700", lineHeight: "1.6" },
  { tag: t.heading2, fontSize: "1.3em", fontWeight: "700", lineHeight: "1.5" },
  { tag: t.heading3, fontSize: "1.15em", fontWeight: "600" },
  { tag: [t.heading4, t.heading5, t.heading6], fontWeight: "600" },
  { tag: t.strong, fontWeight: "700" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "var(--accent)", textDecoration: "underline" },
  { tag: t.monospace, fontFamily: "var(--font-mono)", color: "var(--accent)" },
  { tag: t.quote, color: "var(--text-muted)", fontStyle: "italic" },
]);

// --- Theme (uses app CSS variables so it follows light/dark) ----------------

function editorTheme(): Extension {
  return EditorView.theme({
    "&": {
      color: "var(--text)",
      backgroundColor: "transparent",
      height: "100%",
      fontSize: "14px",
    },
    ".cm-content": {
      fontFamily: "var(--font-app)",
      padding: "4px 0",
      caretColor: "var(--accent)",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "var(--font-app)", lineHeight: "1.7" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--accent)" },
    ".cm-md-hidden": { display: "none" },
    ".cm-math": { cursor: "default" },
    ".cm-math-display": { display: "block", margin: "0.4em 0" },
    "&.cm-editor.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "var(--accent-soft)",
    },
    ".cm-line": { padding: "0" },
  });
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep the latest onChange without recreating the editor.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Create the editor once.
  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(mdHighlight),
        livePreview,
        EditorView.lineWrapping,
        editorTheme(),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            onChangeRef.current(u.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the editor in sync if the value changes from outside (e.g. hydration).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return <div ref={hostRef} className="h-full overflow-auto" />;
}
