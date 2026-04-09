import CommonTable from "@/components/common/CommonTable/CommonTable";

type Props = {
  txTab: "deposit" | "withdraw";
  rows: any[];
};

const REFERRAL_FIELDS = [
  { label: "Email Id", key: "email" },
  { label: "Purchase Token (NEXB)", key: "purchase" },
  { label: "Reward Token (NEXB)", key: "reward" },
  { label: "Reward Percentage", key: "rewardPercentage" },
  { label: "Level", key: "level" },
  { label: "Date", key: "date" },
];

const REWARD_FIELDS = [
  { label: "Email Id", key: "email" },
  { label: "Purchase Token (NEXB)", key: "purchase" },
  { label: "Reward Token (NEXB)", key: "reward" },
  { label: "Level", key: "level" },
  { label: "Date", key: "date" },
];

function formatDate(raw: unknown): string {
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

export default function RewardHistorySection({ txTab, rows }: Props) {
  const rewardSectionTitle = txTab === "deposit" ? "Referral Reward History" : "Reward History";
  const rewardFields = txTab === "deposit" ? REFERRAL_FIELDS : REWARD_FIELDS;

  return (
    <section className="investor-dashboard__table">
      <h2 className="investor-dashboard__section-title">{rewardSectionTitle}</h2>
      <div className="investor-dashboard__table-wrap">
        <CommonTable fields={rewardFields} tableTitle="">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={rewardFields.length} className="text-center text-muted py-3">
                No records found
              </td>
            </tr>
          ) : (
            rows.map((row: any, i: number) => (
              <tr key={i}>
                <td>{cell(row.referredEmail)}</td>
                <td>{cell(row.purchaseAmount)}</td>
                <td>{cell(row.rewardAmount)}</td>
                {txTab === "deposit" && <td>{cell(row.rewardPercentage)}</td>}
                <td>{cell(row.level)}</td>
                <td>{formatDate(row.date ?? row.createdAt)}</td>
              </tr>
            ))
          )}
        </CommonTable>
      </div>
    </section>
  );
}
