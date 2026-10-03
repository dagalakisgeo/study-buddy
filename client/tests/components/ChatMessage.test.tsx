import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ChatMessage } from "@/components/chat/ChatMessage";
import { CitationList } from "@/components/chat/CitationList";

const citation = {
  document_id: "d1",
  filename: "istoria.pdf",
  page: 17,
  snippet: "Ο Ιουστινιανός Α' (527-565)…",
  score: 0.84,
};

describe("ChatMessage", () => {
  it("renders the user's question as plain text", () => {
    render(<ChatMessage message={{ id: 1, role: "user", content: "Ποιος ήταν ο **Ιουστινιανός**;" }} />);

    expect(screen.getByText("Ποιος ήταν ο **Ιουστινιανός**;")).toBeInTheDocument();
  });

  it("renders assistant answers as markdown with citations", () => {
    render(
      <ChatMessage
        message={{ id: 2, role: "assistant", content: "Ήταν **αυτοκράτορας**.", citations: [citation] }}
      />,
    );

    expect(screen.getByText("αυτοκράτορας").tagName).toBe("STRONG");
    expect(screen.getByText("Πηγές (1)")).toBeInTheDocument();
  });

  it("renders errors as an alert", () => {
    render(<ChatMessage message={{ id: 3, role: "assistant", content: "Σφάλμα", isError: true }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Σφάλμα");
  });
});

describe("CitationList", () => {
  it("shows filename, page, relevance and snippet", async () => {
    render(<CitationList citations={[citation]} />);

    await userEvent.click(screen.getByText("Πηγές (1)"));

    expect(screen.getByText(/istoria\.pdf · σελ\. 17/)).toBeInTheDocument();
    expect(screen.getByText("συνάφεια 84%")).toBeInTheDocument();
    expect(screen.getByText(citation.snippet)).toBeInTheDocument();
  });

  it("renders nothing without citations", () => {
    const { container } = render(<CitationList citations={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
