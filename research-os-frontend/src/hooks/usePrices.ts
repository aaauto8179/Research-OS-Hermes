"use client";

import useSWR from "swr";

interface PriceData {
  [symbol: string]: number;
}

interface PricesResponse {
  prices?: PriceData;
  [key: string]: unknown;
}

const fetcher = (url: string): Promise<PricesResponse> => fetch(url).then((r) => r.json());

export function useRealtimePrices(symbols: string[]) {
  const url = symbols.length > 0
    ? `/api/math-engine/prices?symbols=${symbols.join(",")}`
    : null;

  const { data, error, isLoading } = useSWR<PricesResponse>(url, fetcher, {
    refreshInterval: 60000, // 60-second polling as agreed
    revalidateOnFocus: false,
  });

  return {
    prices: (data?.prices as PriceData) || {},
    loading: isLoading,
    error,
  };
}