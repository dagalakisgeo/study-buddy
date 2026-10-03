"use client";

import { useCallback, useEffect, useState } from "react";

import { api, type StudyBuddyApi } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { HealthResponse } from "@/lib/api/types";

export type ConnectionState = "checking" | "ok" | "degraded" | "offline";

export function useHealth(intervalMs: number, client: StudyBuddyApi = api) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await client.getHealth();
      setHealth(result);
      setError(null);
    } catch (err) {
      setHealth(null);
      setError(errorMessage(err));
    } finally {
      setLastChecked(new Date());
    }
  }, [client]);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const timer = setInterval(refresh, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [refresh, intervalMs]);

  const state: ConnectionState =
    lastChecked === null ? "checking" : error ? "offline" : (health?.status ?? "checking");

  return { health, error, lastChecked, state, refresh };
}
