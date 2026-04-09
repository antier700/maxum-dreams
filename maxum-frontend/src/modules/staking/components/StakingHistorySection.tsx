import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import CommonTable from "@/components/common/CommonTable/CommonTable";
import {
  liveAccruedReturns,
  type StakeHistoryRow,
} from "@/modules/staking/stakingHistory.utils";
import { HISTORY_FIELDS, HISTORY_POLL_MS } from "@/modules/staking/staking.constants";

type StakingHistorySectionProps = {
  historyFromApi: boolean;
  nexbSpot?: string;
  nowTick: number;
  onUnstake: (row: StakeHistoryRow) => void;
  rows: StakeHistoryRow[];
};

export function StakingHistorySection({
  historyFromApi,
  nexbSpot,
  nowTick,
  onUnstake,
  rows,
}: StakingHistorySectionProps) {
  return (
    <section className="investor-staking__history">
      <h2 className="investor-staking__section-title">History</h2>
      <p className="bybit-earn-section__hint mb-2">
        {historyFromApi
          ? `Refreshes every ${HISTORY_POLL_MS / 1000}s from GET /user/stakes (or transactions?type=stake).`
          : "Demo rows: accrued returns tick every few seconds until maturity window ends."}
        {nexbSpot ? (
          <>
            {" "}
            NEXB spot (Bybit): <span className="live-price">{nexbSpot}</span> USDT
          </>
        ) : null}
      </p>

      <div className="investor-staking__table-wrap">
        <CommonTable fields={HISTORY_FIELDS} tableTitle="">
          {rows.length === 0 && historyFromApi
            ? null
            : rows.map((row, index) => (
                <tr key={row.id ?? index}>
                  <td>{row.amount}</td>
                  <td>{row.date}</td>
                  <td>{row.maturity}</td>
                  <td>{row.plan}</td>
                  <td className={row.returnsClass}>{liveAccruedReturns(row, nowTick)}</td>
                  <td>
                    {row.unstakeable ? (
                      <CommonButton
                        title="Unstake"
                        onClick={() => onUnstake(row)}
                        className="staking-table-btn"
                      />
                    ) : (
                      <span className={row.actionClass}>{row.action}</span>
                    )}
                  </td>
                </tr>
              ))}
        </CommonTable>
      </div>
    </section>
  );
}
