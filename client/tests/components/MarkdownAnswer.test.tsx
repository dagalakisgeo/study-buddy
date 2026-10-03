import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarkdownAnswer, normalizeMath } from "@/components/chat/MarkdownAnswer";

/** Visible math only — KaTeX also emits hidden MathML that keeps the TeX source for screen readers. */
function visibleText(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".katex-mathml").forEach((node) => node.remove());
  return clone.textContent ?? "";
}

describe("normalizeMath", () => {
  it("converts \\(…\\) to inline dollar math", () => {
    expect(normalizeMath("όπου \\(p = m v\\) η ορμή")).toBe("όπου $p = m v$ η ορμή");
  });

  it("turns \\[…\\] and one-line $$…$$ into fenced display math", () => {
    expect(normalizeMath("\\[K = \\frac{1}{2} m v^2\\]")).toBe("\n$$\nK = \\frac{1}{2} m v^2\n$$\n");
    expect(normalizeMath("$$K = \\frac{p^{2}}{2m}$$")).toBe("\n$$\nK = \\frac{p^{2}}{2m}\n$$\n");
  });

  it("leaves inline dollar math and plain text untouched", () => {
    const text = "Η ορμή $p = mv$ και τίποτε άλλο.";
    expect(normalizeMath(text)).toBe(text);
  });
});

describe("MarkdownAnswer", () => {
  it("renders a one-line $$ fraction (as the LLM writes it) as display math", () => {
    const { container } = render(
      <MarkdownAnswer>{"Η κινητική ενέργεια:\n\n$$K = \\frac{1}{2} m v^{2}$$"}</MarkdownAnswer>,
    );

    expect(container.querySelector(".katex-display")).not.toBeNull();
    expect(container.querySelector(".mfrac")).not.toBeNull();
    expect(visibleText(container)).not.toContain("\\frac");
    expect(visibleText(container)).not.toContain("$$");
  });

  it("renders inline math and \\( \\) delimiters", () => {
    const { container } = render(
      <MarkdownAnswer>{"όπου \\(K = \\frac{p^2}{2m}\\) και $p = mv$"}</MarkdownAnswer>,
    );

    expect(container.querySelectorAll(".katex")).toHaveLength(2);
    expect(container.querySelector(".katex-display")).toBeNull();
    expect(visibleText(container)).not.toContain("\\frac");
  });

  it("still renders normal markdown", () => {
    const { container } = render(<MarkdownAnswer>{"Ήταν **αυτοκράτορας**."}</MarkdownAnswer>);
    expect(container.querySelector("strong")?.textContent).toBe("αυτοκράτορας");
  });
});
