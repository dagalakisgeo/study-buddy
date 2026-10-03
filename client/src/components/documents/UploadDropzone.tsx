"use client";

import { useRef, useState, type DragEvent } from "react";

import { Spinner } from "@/components/ui/Spinner";

/** Returns a Greek error message, or null when the file can be uploaded. */
export function validatePdf(file: File, maxMb: number): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return `Το «${file.name}» δεν είναι PDF. Υποστηρίζονται μόνο αρχεία PDF.`;
  if (file.size > maxMb * 1024 * 1024) {
    return `Το «${file.name}» ξεπερνά το όριο των ${maxMb} MB.`;
  }
  return null;
}

export function UploadDropzone({
  onFile,
  uploading,
  maxMb,
}: {
  onFile: (file: File) => void;
  uploading: boolean;
  maxMb: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file || uploading) return;
    const problem = validatePdf(file, maxMb);
    setValidationError(problem);
    if (!problem) onFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
            : "border-slate-300 hover:border-indigo-400 dark:border-slate-600"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        {uploading ? (
          <>
            <Spinner className="h-6 w-6 text-indigo-600" />
            <p className="font-medium">Επεξεργασία…</p>
            <p className="text-sm text-slate-500">
              Το έγγραφο διαβάζεται και ευρετηριάζεται. Για μεγάλα βιβλία μπορεί να πάρει λίγο χρόνο.
            </p>
          </>
        ) : (
          <>
            <span className="text-3xl" aria-hidden="true">
              📄
            </span>
            <p className="font-medium">Σύρετε ένα PDF εδώ ή κάντε κλικ για επιλογή</p>
            <p className="text-sm text-slate-500">Μόνο αρχεία PDF, έως {maxMb} MB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        data-testid="file-input"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {validationError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {validationError}
        </p>
      )}
    </div>
  );
}
