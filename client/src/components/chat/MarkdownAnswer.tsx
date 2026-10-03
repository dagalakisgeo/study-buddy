import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

/**
 * Prepares LLM output for remark-math:
 * - `\[…\]` and `\(…\)` (which remark-math ignores) become `$$…$$` and `$…$`;
 * - `$$…$$` written on one line (how models usually write it) is parsed by remark-math as
 *   *inline* math, so it is rewritten as a fenced block to render as a centered display formula.
 */
export function normalizeMath(markdown: string): string {
  return markdown
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, math: string) => `$$${math}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, math: string) => `$${math}$`)
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, math: string) => `\n$$\n${math.trim()}\n$$\n`);
}

export function MarkdownAnswer({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        // Greek letters inside formulas are fine to render; don't warn about them.
        rehypePlugins={[[rehypeKatex, { strict: "ignore" }]]}
      >
        {normalizeMath(children)}
      </ReactMarkdown>
    </div>
  );
}
