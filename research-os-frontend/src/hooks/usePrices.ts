"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface PriceData {
  [symbol: string]: number;
}

export function useRealtimePrices(symbols: string[]) {
  const url = symbols.length > 0
    ? `/api/math-engine/prices?symbols=${symbols.join(",")}`
    : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 60000, // 60-second polling as agreed
    revalidateOnFocus: false,
  });

  return {
    prices: (data?.prices as PriceData) || {},
    loading: isLoading,
    error,
  };
}