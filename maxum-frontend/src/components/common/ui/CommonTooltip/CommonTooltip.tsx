import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import './CommonTooltip.scss'

interface CommonTooltipProps {
  content: string | React.ReactNode;
  placement?: "top" | "right" | "bottom" | "left" | "auto";
  delay?: { show: number; hide: number };
  children: React.ReactElement;
  trigger?: "hover" | "click" | "focus" | ("hover" | "click" | "focus")[];
}

const CommonTooltip: React.FC<CommonTooltipProps> = ({
  content,
  placement = "top",
  delay = { show: 250, hide: 100 },
  trigger = "focus",
  children,
}) => {
  return (
    <OverlayTrigger
      placement={placement}
      delay={delay}
      trigger={trigger}
      overlay={<Tooltip id="common-tooltip">{content}</Tooltip>}
    // defaultShow={true}
    >
      {children}
    </OverlayTrigger>
  );
};

export default CommonTooltip;