"use client";

import { useRef, useState, type DragEvent } from "react";

import { MASCOT_NAME } from "@/components/brand/brand";
import { OwlLogo } from "@/components/brand/OwlLogo";

/** Returns a Greek error message, or null when the file can be uploaded. */
export function validatePdf(file: File, maxMb: number): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return `Το «${file.name}» δεν είναι PDF. Μπορείς να ανεβάσεις μόνο αρχεία PDF.`;
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
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "scale-[1.01] border-brand-500 bg-brand-50 dark:bg-brand-950"
            : "border-amber-300 bg-amber-50/50 hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-600 dark:bg-slate-900"
        } ${uploading ? "pointer-events-none" : ""}`}
      >
        {uploading ? (
          <>
            <OwlLogo size={72} mood="thinking" className="animate-owl-bob" />
            <p className="font-display text-lg font-bold">Επεξεργασία…</p>
            <p className="max-w-sm text-sm text-stone-500 dark:text-slate-400">
              Η {MASCOT_NAME} διαβάζει το βιβλίο σου. Τα μεγάλα βιβλία θέλουν λίγο χρόνο, κάνε υπομονή! 📖
            </p>
          </>
        ) : (
          <>
            <span className="text-5xl" aria-hidden="true">
              {dragging ? "📥" : "📚"}
            </span>
            <p className="font-display text-lg font-bold">
              {dragging ? "Άφησέ το εδώ!" : "Ρίξε εδώ ένα PDF ή κάνε κλικ για να το επιλέξεις"}
            </p>
            <p className="text-sm text-stone-500 dark:text-slate-400">
              Σχολικά βιβλία, σημειώσεις, φυλλάδια · μόνο PDF, έως {maxMb} MB
            </p>
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
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {validationError}
        </p>
      )}
    </div>
  );
}
