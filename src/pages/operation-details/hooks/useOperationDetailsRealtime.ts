import { useEffect, useMemo, useRef, useState } from 'react';
import type { OperationDetails } from '@/entities/operation/api/getOperations';

export function useOperationDetailsRealtime(data: OperationDetails | undefined) {
  const [liveMessage, setLiveMessage] = useState('');
  const [highlightedHistoryEventIds, setHighlightedHistoryEventIds] = useState<string[]>([]);

  const previousUpdatedAtRef = useRef<string | null>(null);
  const previousHistoryIdsRef = useRef<string[]>([]);
  const isFirstLivePassRef = useRef(true);

  useEffect(() => {
    if (!data) return;

    if (isFirstLivePassRef.current) {
      previousUpdatedAtRef.current = data.updatedAt;
      previousHistoryIdsRef.current = data.history.map((event) => event.id);
      isFirstLivePassRef.current = false;
      return;
    }

    const previousUpdatedAt = previousUpdatedAtRef.current;
    const previousHistoryIds = previousHistoryIdsRef.current;

    const freshHistoryIds = data.history
      .map((event) => event.id)
      .filter((historyId) => !previousHistoryIds.includes(historyId));

    if (previousUpdatedAt && previousUpdatedAt !== data.updatedAt) {
      setLiveMessage('Карточка кейса обновилась в реальном времени.');
    }

    if (freshHistoryIds.length > 0) {
      setHighlightedHistoryEventIds(freshHistoryIds);

      const timeoutId = window.setTimeout(() => {
        setHighlightedHistoryEventIds((current) =>
          current.filter((eventId) => !freshHistoryIds.includes(eventId)),
        );
      }, 6000);

      previousUpdatedAtRef.current = data.updatedAt;
      previousHistoryIdsRef.current = data.history.map((event) => event.id);

      return () => window.clearTimeout(timeoutId);
    }

    previousUpdatedAtRef.current = data.updatedAt;
    previousHistoryIdsRef.current = data.history.map((event) => event.id);
  }, [data]);

  const highlightedHistoryEventIdSet = useMemo(
    () => new Set(highlightedHistoryEventIds),
    [highlightedHistoryEventIds],
  );

  const highImpactFactors = useMemo(
    () => (data?.riskFactors ?? []).filter((factor) => factor.contribution >= 20),
    [data?.riskFactors],
  );

  return {
    liveMessage,
    setLiveMessage,
    highlightedHistoryEventIdSet,
    highImpactFactors,
  };
}
