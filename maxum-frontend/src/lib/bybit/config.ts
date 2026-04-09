export const BYBIT_REST_BASE = "https://api.bybit.com";

/** Official Bybit v5 public spot WebSocket (earn listing uses spot tickers for live quotes). */
export const BYBIT_SPOT_WS_MAINNET = "wss://stream.bybit.com/v5/public/spot";

export const BYBIT_SPOT_WS =
  process.env.NEXT_PUBLIC_BYBIT_WS_URL?.trim() || BYBIT_SPOT_WS_MAINNET;

/** Base coins that typically have no meaningful {COIN}USDT spot pair for our UI. */
export const BYBIT_TICKER_SKIP_COINS = new Set([
  "USDT",
  "USDC",
  "DAI",
  "BUSD",
  "USD",
]);
