import type { BybitEarnProduct } from "./types";
import { BYBIT_REST_BASE } from "./config";

async function fetchCategory(category: "FlexibleSaving" | "OnChain"): Promise<BybitEarnProduct[]> {
  const url = new URL(`${BYBIT_REST_BASE}/v5/earn/product`);
  url.searchParams.set("category", category);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Bybit HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    retCode: number;
    retMsg: string;
    result?: { list?: BybitEarnProduct[] };
  };
  if (json.retCode !== 0) {
    throw new Error(json.retMsg || "Bybit earn product error");
  }
  return json.result?.list ?? [];
}

export async function fetchAllEarnProducts(): Promise<BybitEarnProduct[]> {
  const [flexible, onchain] = await Promise.all([
    fetchCategory("FlexibleSaving"),
    fetchCategory("OnChain"),
  ]);
  const merged = [...flexible, ...onchain];
  const seen = new Set<string>();
  return merged.filter((p) => {
    const id = p.productId;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
