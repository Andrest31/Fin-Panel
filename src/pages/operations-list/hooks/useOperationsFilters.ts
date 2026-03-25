import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getOperationsFiltersFromSearchParams,
  toOperationsSearchParams,
} from "@/features/operation-filters/lib/searchParams";
import {
  defaultOperationsFilters,
  type OperationsFilterValues,
} from "@/features/operation-filters/model/types";

export function useOperationsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => getOperationsFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const updateFilters = (nextFilters: OperationsFilterValues) => {
    setSearchParams(toOperationsSearchParams(nextFilters));
  };

  const resetFilters = () => {
    setSearchParams(toOperationsSearchParams(defaultOperationsFilters));
  };

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}
