"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BybitEarnProduct } from "@/lib/bybit/types";
import {
  BYBIT_SPOT_WS,
  BYBIT_SPOT_WS_MAINNET,
  BYBIT_TICKER_SKIP_COINS,
} from "@/lib/bybit/config";

const SPOT_SUBSCRIBE_CHUNK = 10;
const WS_PING_MS = 20_000;
const WS_RECONNECT_MS = 3_000;

function toSpotSymbols(baseCoins: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const c of baseCoins) {
    if (!c || BYBIT_TICKER_SKIP_COINS.has(c)) continue;
    const sym = `${c}USDT`;
    if (seen.has(sym)) continue;
    seen.add(sym);
    out.push(sym);
  }
  return out.slice(0, 80);
}

function parseTickerMessage(raw: unknown): { base: string; lastPrice: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const msg = raw as {
    topic?: string;
    data?: Record<string, unknown> | Record<string, unknown>[];
  };
  if (!msg.topic?.startsWith("tickers.")) return null;
  const d = msg.data;
  const row = Array.isArray(d) ? d[0] : d;
  if (!row || typeof row !== "object") return null;
  const symbol = row.symbol as string | undefined;
  const lastPrice = row.lastPrice as string | undefined;
  if (!symbol || !lastPrice) return null;
  if (!symbol.endsWith("USDT")) return null;
  const base = symbol.slice(0, -"USDT".length);
  return { base, lastPrice };
}

export interface UseBybitEarnListingResult {
  products: BybitEarnProduct[];
  lastPriceByCoin: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Loads Bybit earn products via our API route and attaches spot last prices over WebSocket.
 * `syncKey` should change on login/logout so listings and the socket reconnect stay aligned.
 */
export function useBybitEarnListing(syncKey: string): UseBybitEarnListingResult {
  const [products, setProducts] = useState<BybitEarnProduct[]>([]);
  const [lastPriceByCoin, setLastPriceByCoin] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bybit/earn-products", { cache: "no-store" });
      const json = (await res.json()) as { list?: BybitEarnProduct[]; error?: string };
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setProducts(json.list ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load earn products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch, syncKey]);

  const baseCoins = useMemo(
    () => [...new Set(products.map((p) => p.coin).filter(Boolean))],
    [products]
  );

  const symbolKey = useMemo(() => toSpotSymbols(baseCoins).join(","), [baseCoins]);

  const priceRef = useRef<Record<string, string>>({});
  useEffect(() => {
    priceRef.current = lastPriceByCoin;
  }, [lastPriceByCoin]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const symbols = toSpotSymbols(baseCoins);
    if (symbols.length === 0) {
      priceRef.current = {};
      setLastPriceByCoin({});
      return;
    }

    priceRef.current = {};
    setLastPriceByCoin({});
    let ws: WebSocket | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const subscribeAll = (socket: WebSocket) => {
      for (let i = 0; i < symbols.length; i += SPOT_SUBSCRIBE_CHUNK) {
        const chunk = symbols.slice(i, i + SPOT_SUBSCRIBE_CHUNK);
        const args = chunk.map((s) => `tickers.${s}`);
        socket.send(JSON.stringify({ op: "subscribe", args }));
      }
    };

    const connect = () => {
      if (stopped) return;
      ws = new WebSocket(BYBIT_SPOT_WS);

      ws.onopen = () => {
        const normalized = BYBIT_SPOT_WS.replace(/\/$/, "");
        const expected = BYBIT_SPOT_WS_MAINNET.replace(/\/$/, "");
        if (normalized !== expected && !normalized.endsWith("/v5/public/spot")) {
          console.warn(
            "[bybit-earn] WebSocket should use Bybit v5 public spot stream, e.g.",
            BYBIT_SPOT_WS_MAINNET,
            "got:",
            BYBIT_SPOT_WS
          );
        }
        subscribeAll(ws!);
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: "ping" }));
          }
        }, WS_PING_MS);
      };

      ws.onmessage = (ev) => {
        try {
          const raw = JSON.parse(ev.data as string) as {
            op?: string;
            ret_msg?: string;
            topic?: string;
          };
          if (raw.ret_msg === "pong" || raw.op === "pong") return;
          const parsed = parseTickerMessage(raw);
          if (!parsed) return;
          if (priceRef.current[parsed.base] === parsed.lastPrice) return;
          const next = { ...priceRef.current, [parsed.base]: parsed.lastPrice };
          priceRef.current = next;
          setLastPriceByCoin(next);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => {
        /* close triggers reconnect */
      };

      ws.onclose = () => {
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = null;
        }
        if (!stopped) {
          reconnectTimer = setTimeout(connect, WS_RECONNECT_MS);
        }
      };
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingTimer) clearInterval(pingTimer);
      ws?.close();
    };
  }, [syncKey, symbolKey]);

  return { products, lastPriceByCoin, isLoading, error, refetch };
}
