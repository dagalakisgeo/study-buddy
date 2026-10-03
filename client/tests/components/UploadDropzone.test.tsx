import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UploadDropzone, validatePdf } from "@/components/documents/UploadDropzone";

const pdf = (name = "book.pdf", size = 10) =>
  new File([new Uint8Array(size)], name, { type: "application/pdf" });

describe("validatePdf", () => {
  it("accepts PDFs under the limit", () => {
    expect(validatePdf(pdf(), 1)).toBeNull();
  });

  it("rejects non-PDF files", () => {
    const txt = new File(["hi"], "notes.txt", { type: "text/plain" });
    expect(validatePdf(txt, 1)).toContain("δεν είναι PDF");
  });

  it("rejects files over the limit", () => {
    expect(validatePdf(pdf("big.pdf", 2 * 1024 * 1024), 1)).toContain("ξεπερνά το όριο");
  });
});

describe("UploadDropzone", () => {
  it("passes a valid PDF to onFile", async () => {
    const onFile = vi.fn();
    render(<UploadDropzone onFile={onFile} uploading={false} maxMb={20} />);

    await userEvent.upload(screen.getByTestId("file-input"), pdf());

    expect(onFile).toHaveBeenCalledWith(expect.objectContaining({ name: "book.pdf" }));
  });

  it("shows a validation error instead of uploading an invalid file", async () => {
    const onFile = vi.fn();
    render(<UploadDropzone onFile={onFile} uploading={false} maxMb={20} />);

    await userEvent.upload(screen.getByTestId("file-input"), new File(["x"], "a.txt"), {
      applyAccept: false,
    });

    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("δεν είναι PDF");
  });

  it("shows progress while uploading", () => {
    render(<UploadDropzone onFile={vi.fn()} uploading maxMb={20} />);
    expect(screen.getByText("Επεξεργασία…")).toBeInTheDocument();
  });
});
