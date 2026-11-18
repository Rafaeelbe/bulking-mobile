import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../services/api";
import type { DailySummary } from "../types/nutrition";

const USER_ID = 1;

export function useDailySummary(date: string) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet<DailySummary>(
        `/meals/daily-summary?userId=${USER_ID}&date=${date}`,
      );

      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar resumo.",
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const timeout = setTimeout(() => void reload(), 0);

    return () => clearTimeout(timeout);
  }, [reload]);

  return { summary, loading, error, reload };
}
