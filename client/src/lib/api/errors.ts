/** Status 0 means the server could not be reached at all. */
export const NETWORK_ERROR_STATUS = 0;

const STATUS_MESSAGES: Record<number, string> = {
  400: "Μη έγκυρο αίτημα.",
  404: "Δεν βρέθηκε.",
  413: "Το αρχείο είναι πολύ μεγάλο.",
  415: "Υποστηρίζονται μόνο αρχεία PDF.",
  422: "Το αίτημα ή το αρχείο δεν είναι έγκυρο.",
  500: "Εσωτερικό σφάλμα διακομιστή.",
  502: "Σφάλμα του γλωσσικού μοντέλου. Δοκιμάστε ξανά σε λίγο.",
  503: "Η βάση διανυσμάτων δεν είναι διαθέσιμη.",
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }

  static network(baseUrl: string): ApiError {
    return new ApiError(
      NETWORK_ERROR_STATUS,
      `Ο διακομιστής δεν είναι διαθέσιμος στο ${baseUrl}. Βεβαιωθείτε ότι εκτελείται.`,
    );
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const detail = await readDetail(response);
    const base = STATUS_MESSAGES[response.status] ?? `Σφάλμα διακομιστή (${response.status}).`;
    return new ApiError(response.status, detail ? `${base} ${detail}` : base, detail);
  }
}

/** FastAPI returns `{detail: string}` for app errors and `{detail: [{msg}]}` for validation errors. */
async function readDetail(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("detail" in body)) return undefined;
    const { detail } = body as { detail: unknown };
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => (item && typeof item === "object" && "msg" in item ? String(item.msg) : ""))
        .filter(Boolean)
        .join("; ");
    }
  } catch {
    // Body was empty or not JSON.
  }
  return undefined;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Παρουσιάστηκε απρόσμενο σφάλμα.";
}
