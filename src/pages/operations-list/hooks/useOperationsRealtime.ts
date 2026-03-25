import { useEffect, useRef, useState } from "react";
import type { GetOperationsResponse } from "@/entities/operation/api/getOperations";
import type { OperationsFilterValues } from "@/features/operation-filters/model/types";
import { getRealtimeMessage, isRealtimeSensitiveView } from "../lib/realtime";

export function useOperationsRealtime(
  data: GetOperationsResponse | undefined,
  filters: OperationsFilterValues,
) {
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [realtimeMessage, setRealtimeMessage] = useState("");
  const previousTopIdsRef = useRef<string[]>([]);
  const isFirstRealtimePassRef = useRef(true);

  useEffect(() => {
    if (!data) return;

    const currentIds = data.items.map((item) => item.id);

    if (isFirstRealtimePassRef.current) {
      previousTopIdsRef.current = currentIds;
      isFirstRealtimePassRef.current = false;
      return;
    }

    if (!isRealtimeSensitiveView(filters)) {
      previousTopIdsRef.current = currentIds;
      return;
    }

    const previousIds = previousTopIdsRef.current;
    const newIds = currentIds.filter((id) => !previousIds.includes(id));

    if (newIds.length > 0) {
      setHighlightedIds((current) =>
        Array.from(new Set([...newIds, ...current])),
      );
      setRealtimeMessage(getRealtimeMessage(newIds.length));

      const timeoutId = window.setTimeout(() => {
        setHighlightedIds((current) =>
          current.filter((id) => !newIds.includes(id)),
        );
      }, 6000);

      previousTopIdsRef.current = currentIds;
      return () => window.clearTimeout(timeoutId);
    }

    previousTopIdsRef.current = currentIds;
  }, [data, filters]);

  return {
    highlightedIds,
    setHighlightedIds,
    realtimeMessage,
    setRealtimeMessage,
  };
}
