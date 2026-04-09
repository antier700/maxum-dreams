import { memo } from "react";
import { Col, Row } from "react-bootstrap";
import { AvailableBalanceIcon, GiftIcon, Security2Icon, WithdrawableBalanceIcon } from "@/assets/icons/svgIcon";

type Props = {
  statsData: any;
};

function BalanceCardsSection({ statsData }: Props) {
  const mappedBalanceCards = [
    {
      label: "Available Balance",
      value: `${statsData?.availableBalance ?? "0.00"} NEXB`,
      icon: <AvailableBalanceIcon />,
    },
    {
      label: "Total staked",
      value: `${statsData?.totalStakedPrincipal ?? "0.00"} NEXB`,
      icon: <WithdrawableBalanceIcon />,
    },
    {
      label: "Reward Balance",
      value: `${statsData?.rewardBalance ?? "0.00"} NEXB`,
      icon: <GiftIcon />,
    },
    {
      label: `Status : ${statsData?.twoFaEnabled ? "Enabled" : "Disabled"}`,
      value: "2FA",
      status: statsData?.twoFaEnabled ? "enabled" : "disabled",
      icon: <Security2Icon />,
    },
  ];

  return (
    <Row className="investor-dashboard__cards g-3 mb-4 mb-md-5">
      {mappedBalanceCards.map((card) => (
        <Col key={card.label} sm={6} lg={3} className="balance-card-col">
          <div className="balance-card">
            <div className="balance-card__top">
              <span className="balance-card__label">{card.label}</span>
              <span className="balance-card__icon">{card.icon}</span>
            </div>
            <span className={`balance-card__value ${card.status === "disabled" ? "balance-card__value--danger" : ""}`}>
              {card.value}
            </span>
          </div>
        </Col>
      ))}
    </Row>
  );
}

export default memo(BalanceCardsSection);
