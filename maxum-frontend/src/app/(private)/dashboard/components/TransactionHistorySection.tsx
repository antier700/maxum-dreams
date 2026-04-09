import { useEffect, useMemo, useState } from "react";
import CommonTable from "@/components/common/CommonTable/CommonTable";
import CustomPagination from "@/components/common/ui/CustomPagination/CustomPagination";

const PAGE_SIZE = 10;

type Props = {
  txTab: "deposit" | "withdraw";
  onChangeTab: (tab: "deposit" | "withdraw") => void;
  rows: any[];
};

const TX_FIELDS = [
  { label: "Token", key: "token" },
  { label: "Amount", key: "amount" },
  { label: "Transaction Hash", key: "hash" },
  { label: "Address From", key: "fromAddress" },
  { label: "Address To", key: "toAddress" },
  { label: "Date", key: "date" },
  { label: "Status", key: "status" },
];

function formatTxDate(raw: unknown): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw as string);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(raw);
  }
}

function cell(v: unknown): string {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : "—";
}

export default function TransactionHistorySection({ txTab, onChangeTab, rows }: Props) {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [txTab]);

  useEffect(() => {
    const maxIdx = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
    setPageIndex((p) => Math.min(p, maxIdx));
  }, [rows.length]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(rows.length / PAGE_SIZE) || 1),
    [rows.length]
  );

  const paginatedRows = useMemo(
    () => rows.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE),
    [rows, pageIndex]
  );

  return (
    <section className="investor-dashboard__table mb-4">
      <h2 className="investor-dashboard__section-title">Transaction History</h2>
      <div className="investor-dashboard__table_inner">
        <div className="investor-dashboard__tabs mt-4">
          <button
            type="button"
            className={txTab === "deposit" ? "active" : ""}
            onClick={() => onChangeTab("deposit")}
          >
            Deposit History
          </button>
          <button
            type="button"
            className={txTab === "withdraw" ? "active" : ""}
            onClick={() => onChangeTab("withdraw")}
          >
            Withdraw History
          </button>
        </div>
        <div className="investor-dashboard__table-wrap">
          <CommonTable fields={TX_FIELDS} tableTitle="">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={TX_FIELDS.length} className="text-center text-muted py-3">
                  No transactions found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row: any, i: number) => (
                <tr key={row.id ?? `${pageIndex}-${i}`}>
                  <td>{cell(row.token)}</td>
                  <td>{cell(row.amount)}</td>
                  <td className="text-truncate" style={{ maxWidth: 140 }} title={row.hash || ""}>
                    {cell(row.hash)}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 140 }} title={row.fromAddress || ""}>
                    {cell(row.fromAddress)}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 160 }} title={row.toAddress || row.walletAddress || ""}>
                    {cell(row.toAddress || row.walletAddress)}
                  </td>
                  <td>{formatTxDate(row.date ?? row.createdAt)}</td>
                  <td
                    className={
                      String(row.status || "").toLowerCase() === "completed"
                        ? "text-green"
                        : "text-danger-status"
                    }
                  >
                    {cell(row.status)}
                  </td>
                </tr>
              ))
            )}
          </CommonTable>
        </div>
        <div className="investor-dashboard__tx-pagination mt-3">
          <CustomPagination
            limit={PAGE_SIZE}
            totalDocs={rows.length}
            pageCount={pageCount}
            pageIndex={pageIndex}
            handlePageChange={(e) => setPageIndex(e.selected)}
          />
        </div>
      </div>
    </section>
  );
}
