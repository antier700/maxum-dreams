"use client";

import { memo, useEffect, useMemo, useState } from "react";
import CommonTable from "@/components/common/CommonTable/CommonTable";
import CustomPagination from "@/components/common/ui/CustomPagination/CustomPagination";
import type { BybitEarnProduct } from "@/lib/bybit/types";
import { BYBIT_TICKER_SKIP_COINS } from "@/lib/bybit/config";
import { CoinIcon } from "@/modules/staking/CoinIcon";

const PAGE_SIZE = 10;

const FIELDS = [
  { label: "Coin", key: "coin" },
  { label: "Category", key: "category" },
  { label: "Est. APR", key: "apr" },
  { label: "Duration", key: "duration" },
  { label: "Min / Max", key: "limits" },
  { label: "Status", key: "status" },
  { label: "Spot (USDT)", key: "price" },
];

function formatDuration(p: BybitEarnProduct): string {
  if (p.duration === "Fixed" && p.term) return `${p.term}d`;
  if (p.duration === "Flexible") return "Flexible";
  if (p.duration) return p.duration;
  return "—";
}

export type BybitEarnTableProps = {
  products: BybitEarnProduct[];
  lastPriceByCoin: Record<string, string>;
  loader?: boolean;
};

function BybitEarnTableInner({ products, lastPriceByCoin, loader }: BybitEarnTableProps) {
  const [pageIndex, setPageIndex] = useState(0);

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  useEffect(() => {
    const maxIndex = Math.max(0, Math.ceil(products.length / PAGE_SIZE) - 1);
    setPageIndex((i) => Math.min(i, maxIndex));
  }, [products.length]);

  const pageSlice = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, pageIndex]);

  return (
    <section className="bybit-earn-section">
      <h2 className="investor-staking__section-title">Bybit earn (live listing)</h2>
      <p className="bybit-earn-section__hint">
        Products from Bybit&apos;s public earn API. Spot last prices update in real time over WebSocket
        (BASEUSDT tickers on {`wss://stream.bybit.com/v5/public/spot`}); some assets may not have a
        matching spot market.
      </p>
      <div className="investor-staking__table-wrap">
        <CommonTable fields={FIELDS} tableTitle="" loader={loader}>
          {pageSlice.map((p) => {
            const live = lastPriceByCoin[p.coin];
            const skipTicker = BYBIT_TICKER_SKIP_COINS.has(p.coin);
            return (
              <tr key={p.productId}>
                <td>
                  <div className="coin-cell">
                    <CoinIcon symbol={p.coin} size={28} />
                    <span className="coin-cell__text">
                      <strong>{p.coin}</strong>
                      {p.swapCoin ? (
                        <span className="live-price--muted"> → {p.swapCoin}</span>
                      ) : null}
                    </span>
                  </div>
                </td>
                <td>{p.category}</td>
                <td>{p.estimateApr || "—"}</td>
                <td>{formatDuration(p)}</td>
                <td>
                  {p.minStakeAmount} / {p.maxStakeAmount}
                </td>
                <td>{p.status}</td>
                <td>
                  {skipTicker ? (
                    <span className="live-price--muted">—</span>
                  ) : live ? (
                    <span className="live-price">{live}</span>
                  ) : (
                    <span className="live-price--muted">…</span>
                  )}
                </td>
              </tr>
            );
          })}
        </CommonTable>
      </div>

      {/* Client-side slice only — earn products are already loaded; no extra listing API for pages. */}
      {!loader && products.length > PAGE_SIZE && (
        <div className="bybit-earn-section__pagination">
          <CustomPagination
            limit={PAGE_SIZE}
            totalDocs={products.length}
            pageCount={pageCount}
            pageIndex={pageIndex}
            handlePageChange={(e) => setPageIndex(e.selected)}
          />
        </div>
      )}
    </section>
  );
}

export const BybitEarnTable = memo(BybitEarnTableInner);
