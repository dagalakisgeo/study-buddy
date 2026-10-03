// NEXT_PUBLIC_* variables are inlined at build time, so they must be referenced literally.
const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";
const DEFAULT_MAX_UPLOAD_MB = 20;

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
  /\/+$/,
  "",
);

export const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB) || DEFAULT_MAX_UPLOAD_MB;
