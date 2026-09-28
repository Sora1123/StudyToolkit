"use client";

import { Fragment, ReactNode } from "react";
import { LatexExpression } from "@latex-math/react";

/**
 * A small, dependency-free Markdown + LaTeX renderer for Quick Notes.
 *
 * It intentionally supports a pragmatic subset rather than full CommonMark:
 * headings, blockquotes, unordered/ordered lists, fenced code blocks, inline
 * code, bold, italic, links, horizontal rules — plus LaTeX math via `$…$`
 * (inline) and `$$…$$` (display), rendered with @latex-math/react (KaTeX).
 *
 * Everything is built into React nodes (never dangerouslySetInnerHTML on user
 * text), so there's no HTML-injection surface from note content.
 */

// --- Inline parsing --------------------------------------------------------

/** Escape use in a RegExp is unnecessary here; we scan manually for safety. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let buf = "";
  let key = 0;

  const flush = () => {
    if (buf) {
      nodes.push(<Fragment key={`${keyPrefix}-t${key++}`}>{buf}</Fragment>);
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];

    // Inline math: $...$ (not $$, which is handled at block level).
    if (ch === "$") {
      const end = text.indexOf("$", i + 1);
      if (end > i) {
        const expr = text.slice(i + 1, end);
        flush();
        nodes.push(
          <LatexExpression
            key={`${keyPrefix}-m${key++}`}
            expression={expr}
            output="html"
          />,
        );
        i = end + 1;
        continue;
      }
    }

    // Inline code: `...`
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i) {
        flush();
        nodes.push(
          <code
            key={`${keyPrefix}-c${key++}`}
            className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em]"
          >
            {text.slice(i + 1, end)}
          </code>,
        );
        i = end + 1;
        continue;
      }
    }

    // Bold: **...**
    if (ch === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i) {
        flush();
        nodes.push(
          <strong key={`${keyPrefix}-b${key++}`} className="font-semibold">
            {renderInline(text.slice(i + 2, end), `${keyPrefix}-b${key}`)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }

    // Italic: *...* or _..._
    if (ch === "*" || ch === "_") {
      const end = text.indexOf(ch, i + 1);
      if (end > i && end !== i + 1) {
        flush();
        nodes.push(
          <em key={`${keyPrefix}-i${key++}`} className="italic">
            {renderInline(text.slice(i + 1, end), `${keyPrefix}-i${key}`)}
          </em>,
        );
        i = end + 1;
        continue;
      }
    }

    // Link: [label](url)
    if (ch === "[") {
      const labelEnd = text.indexOf("]", i + 1);
      if (labelEnd > i && text[labelEnd + 1] === "(") {
        const urlEnd = text.indexOf(")", labelEnd + 2);
        if (urlEnd > labelEnd) {
          const label = text.slice(i + 1, labelEnd);
          const url = text.slice(labelEnd + 2, urlEnd).trim();
          // Only allow http(s) links to avoid javascript: URLs.
          if (/^https?:\/\//i.test(url)) {
            flush();
            nodes.push(
              <a
                key={`${keyPrefix}-l${key++}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent-hover"
              >
                {renderInline(label, `${keyPrefix}-l${key}`)}
              </a>,
            );
            i = urlEnd + 1;
            continue;
          }
        }
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return nodes;
}

// --- Block parsing ---------------------------------------------------------

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "code"; text: string }
  | { type: "math"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "hr" }
  | { type: "p"; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line — skip.
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block: ```
    if (line.trim().startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", text: body.join("\n") });
      continue;
    }

    // Display math block: $$ ... $$
    if (line.trim() === "$$") {
      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "$$") {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing $$
      blocks.push({ type: "math", text: body.join("\n") });
      continue;
    }
    // Single-line $$...$$
    const inlineDisplay = line.trim().match(/^\$\$(.+)\$\$$/);
    if (inlineDisplay) {
      blocks.push({ type: "math", text: inlineDisplay[1] });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2],
      });
      i++;
      continue;
    }

    // Blockquote (consecutive > lines)
    if (line.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        body.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: body.join("\n") });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph — gather consecutive non-blank, non-special lines.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].startsWith(">") &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^[-*+]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

const HEADING_CLASS: Record<number, string> = {
  1: "text-xl font-bold mt-3 mb-1.5",
  2: "text-lg font-bold mt-3 mb-1.5",
  3: "text-base font-semibold mt-2 mb-1",
  4: "text-sm font-semibold mt-2 mb-1",
  5: "text-sm font-semibold mt-1.5 mb-0.5",
  6: "text-xs font-semibold uppercase tracking-wide mt-1.5 mb-0.5",
};

export default function MarkdownView({ source }: { source: string }) {
  const blocks = parseBlocks(source);

  if (blocks.length === 0) {
    return <p className="text-sm text-faint">Nothing to preview yet.</p>;
  }

  return (
    <div className="text-sm leading-relaxed text-text">
      {blocks.map((b, idx) => {
        const key = `blk-${idx}`;
        switch (b.type) {
          case "heading": {
            const Tag = `h${b.level}` as keyof React.JSX.IntrinsicElements;
            return (
              <Tag key={key} className={HEADING_CLASS[b.level]}>
                {renderInline(b.text, key)}
              </Tag>
            );
          }
          case "code":
            return (
              <pre
                key={key}
                className="my-2 overflow-x-auto rounded-md bg-surface-2 p-2.5 font-mono text-xs"
              >
                <code>{b.text}</code>
              </pre>
            );
          case "math":
            return (
              <div key={key} className="my-2 overflow-x-auto">
                <LatexExpression expression={b.text} displayMode output="html" />
              </div>
            );
          case "quote":
            return (
              <blockquote
                key={key}
                className="my-2 border-l-2 border-line-strong pl-3 text-muted"
              >
                {renderInline(b.text, key)}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={key} className="my-1.5 list-disc space-y-0.5 pl-5">
                {b.items.map((it, j) => (
                  <li key={`${key}-${j}`}>{renderInline(it, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="my-1.5 list-decimal space-y-0.5 pl-5">
                {b.items.map((it, j) => (
                  <li key={`${key}-${j}`}>{renderInline(it, `${key}-${j}`)}</li>
                ))}
              </ol>
            );
          case "hr":
            return <hr key={key} className="my-3 border-line" />;
          case "p":
          default:
            return (
              <p key={key} className="my-1.5">
                {renderInline((b as { text: string }).text, key)}
              </p>
            );
        }
      })}
    </div>
  );
}
