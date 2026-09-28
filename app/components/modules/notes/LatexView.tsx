"use client";

import { LatexExpression } from "@latex-math/react";

/**
 * A pragmatic LaTeX preview for Quick Notes' "LaTeX" mode.
 *
 * @latex-math/react (KaTeX) renders math expressions, not full LaTeX articles,
 * so we don't attempt to compile a document preamble. Instead we strip the
 * common document-level commands KaTeX cannot handle (\documentclass, \usepackage,
 * \begin{document}, \section, etc.), then render each blank-line-separated block
 * as a display-mode expression. This covers the realistic study use-case:
 * equations, aligned environments, matrices, and math-heavy notes.
 */

const STRIP_LINE_PATTERNS: RegExp[] = [
  /^\s*\\documentclass.*$/,
  /^\s*\\usepackage.*$/,
  /^\s*\\begin\{document\}\s*$/,
  /^\s*\\end\{document\}\s*$/,
  /^\s*\\maketitle\s*$/,
  /^\s*\\title\{.*\}\s*$/,
  /^\s*\\author\{.*\}\s*$/,
  /^\s*\\date\{.*\}\s*$/,
];

/** Turn common sectioning commands into plain headings we render as text. */
function sectioningToText(line: string): string | null {
  const m = line.match(/^\s*\\(section|subsection|subsubsection)\*?\{(.*)\}\s*$/);
  return m ? m[2] : null;
}

interface Segment {
  kind: "heading" | "math";
  text: string;
}

function parse(src: string): Segment[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const segments: Segment[] = [];
  let mathBuf: string[] = [];

  const flushMath = () => {
    const joined = mathBuf.join("\n").trim();
    if (joined) segments.push({ kind: "math", text: joined });
    mathBuf = [];
  };

  for (const line of lines) {
    if (STRIP_LINE_PATTERNS.some((re) => re.test(line))) continue;

    const heading = sectioningToText(line);
    if (heading !== null) {
      flushMath();
      segments.push({ kind: "heading", text: heading });
      continue;
    }

    if (line.trim() === "") {
      flushMath();
      continue;
    }

    mathBuf.push(line);
  }
  flushMath();
  return segments;
}

export default function LatexView({ source }: { source: string }) {
  const segments = parse(source);

  if (segments.length === 0) {
    return <p className="text-sm text-faint">Nothing to preview yet.</p>;
  }

  return (
    <div className="space-y-2 text-sm text-text">
      {segments.map((seg, i) =>
        seg.kind === "heading" ? (
          <h3 key={i} className="mt-3 text-base font-semibold">
            {seg.text}
          </h3>
        ) : (
          <div key={i} className="overflow-x-auto">
            <LatexExpression expression={seg.text} displayMode output="html" />
          </div>
        ),
      )}
    </div>
  );
}
