import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MASCOT_NAME } from "@/components/brand/brand";
import { OwlLogo } from "@/components/brand/OwlLogo";
import { ChatWelcome, STARTER_QUESTIONS } from "@/components/chat/ChatWelcome";
import { BookShelf, bookTitle } from "@/components/documents/BookShelf";

describe("OwlLogo", () => {
  it("is labelled when given a title and decorative otherwise", () => {
    const { container, rerender } = render(<OwlLogo title="Σοφούλα" />);
    expect(screen.getByRole("img", { name: "Σοφούλα" })).toBeInTheDocument();

    rerender(<OwlLogo />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("closes its eyes when sleepy", () => {
    const { container } = render(<OwlLogo mood="sleepy" />);
    // Open eyes are white circles of radius 6; sleepy eyes are drawn as arcs.
    expect(container.querySelectorAll('circle[r="6"]')).toHaveLength(0);
  });
});

describe("ChatWelcome", () => {
  it("greets the student and asks a starter question when a chip is clicked", async () => {
    const onPick = vi.fn();
    render(<ChatWelcome onPick={onPick} disabled={false} />);

    expect(screen.getByText(new RegExp(`Είμαι η ${MASCOT_NAME}`))).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: STARTER_QUESTIONS[2] }));

    expect(onPick).toHaveBeenCalledWith(STARTER_QUESTIONS[2]);
  });
});

describe("BookShelf", () => {
  it("turns file names into readable titles", () => {
    expect(bookTitle("Mesaioniki-kai-Neoteri_Istoria.pdf")).toBe("Mesaioniki kai Neoteri Istoria");
    expect(bookTitle("Φυσική.PDF")).toBe("Φυσική");
  });

  it("shows each book and deletes on click", async () => {
    const onDelete = vi.fn();
    const book = { document_id: "d1", filename: "Istoria-B.pdf", chunks: 61 };
    render(<BookShelf documents={[book]} deletingId={null} onDelete={onDelete} />);

    expect(screen.getByText("Istoria B")).toBeInTheDocument();
    expect(screen.getByText("61 τμήματα γνώσης")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Διαγραφή Istoria-B.pdf" }));
    expect(onDelete).toHaveBeenCalledWith(book);
  });

  it("shows a friendly empty state", () => {
    render(<BookShelf documents={[]} deletingId={null} onDelete={vi.fn()} />);
    expect(screen.getByText("Η βιβλιοθήκη σου είναι άδεια")).toBeInTheDocument();
  });
});
