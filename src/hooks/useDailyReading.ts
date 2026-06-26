import { useState, useEffect, useCallback } from 'react';

interface Card {
  id: number;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  arcangel: string;
  shortMsg: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: string;
}

interface DailyReading {
  id: string;
  question: string;
  type: number;
  cards: Card[];
  messages: Message[];
  createdAt: string;
}

interface UseDailyReadingResult {
  loading: boolean;
  hasReadingToday: boolean;
  canCreateNew: boolean;
  todayReading: DailyReading | null;
  error: string | null;
  requiresMembership: boolean;
  checkDailyReading: () => Promise<void>;
  refreshReading: () => Promise<void>;
}

export function useDailyReading(): UseDailyReadingResult {
  const [loading, setLoading] = useState(true);
  const [hasReadingToday, setHasReadingToday] = useState(false);
  const [canCreateNew, setCanCreateNew] = useState(true);
  const [todayReading, setTodayReading] = useState<DailyReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresMembership, setRequiresMembership] = useState(false);

  const checkDailyReading = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/oraculo/daily-reading');
      const data = await response.json();

      if (response.status === 403 && data.requiresMembership) {
        setRequiresMembership(true);
        setHasReadingToday(false);
        setCanCreateNew(false);
        setTodayReading(null);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar consulta diaria');
      }

      setHasReadingToday(data.hasReadingToday);
      setCanCreateNew(data.canCreateNew);
      setTodayReading(data.reading || null);
      setRequiresMembership(false);

    } catch (err) {
      console.error('Error checking daily reading:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setHasReadingToday(false);
      setCanCreateNew(false);
      setTodayReading(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshReading = useCallback(async () => {
    if (todayReading?.id) {
      try {
        const response = await fetch(`/api/oraculo/reading/${todayReading.id}`);
        const data = await response.json();

        if (response.ok) {
          setTodayReading(data);
        }
      } catch (err) {
        console.error('Error refreshing reading:', err);
      }
    }
  }, [todayReading?.id]);

  useEffect(() => {
    checkDailyReading();
  }, [checkDailyReading]);

  return {
    loading,
    hasReadingToday,
    canCreateNew,
    todayReading,
    error,
    requiresMembership,
    checkDailyReading,
    refreshReading
  };
}