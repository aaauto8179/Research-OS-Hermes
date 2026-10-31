"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface PriceData {
  [symbol: string]: number;
}

export function useRealtimePrices(symbols: string[]) {
  const wsRef = useRef<WebSocket | null>(null);
  const [prices, setPrices] = useState<PriceData>({});
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_MATH_ENGINE_WS_URL || "wss://math-engine-api.vercel.app/ws/prices";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ symbols }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.prices) {
        setPrices((prev) => ({ ...prev, ...data.prices }));
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [symbols]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { prices, connected };
}