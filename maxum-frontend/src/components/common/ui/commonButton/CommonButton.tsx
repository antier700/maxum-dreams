import type { ReactNode, Ref } from "react";
import { Spinner } from "react-bootstrap";
import "./CommonButton.scss";
import Link from "next/link";

type CommonButtonProps = {
  title?: string;
  className?: string;
  svgIcon?: ReactNode;
  imageIcon?: string;
  onClick?: () => void;
  to?: string;
  id?: string;
  role?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  fluid?: boolean;
  text?: string;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement | HTMLAnchorElement>;
  target?: string;
};

const CommonButton = ({
  title,
  className = "",
  svgIcon,
  imageIcon,
  onClick,
  to,
  role,
  type = "button",
  disabled = false,
  isLoading = false,
  fluid,
  text,
  children,
  ref,
  target,
}: CommonButtonProps) => {
  const buttonClass = `common_btn ${fluid ? "full" : ""} ${className}`;

  if (role === "link" && to) {
    return (
      <Link
        href={to}
        className={buttonClass}
        onClick={onClick}
        target={target}
        ref={ref as Ref<HTMLAnchorElement>}
      >
        {svgIcon && <span className="common_btn_icon">{svgIcon}</span>}
        {imageIcon && (
          <span className="common_btn_icon">
            <img fetchPriority="high" src={imageIcon} alt="" />
          </span>
        )}
        {title}
        {isLoading ? <Spinner /> : text}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={Boolean(disabled)}
      type={type}
      ref={ref as Ref<HTMLButtonElement>}
    >
      {svgIcon && <span className="common_btn_icon">{svgIcon}</span>}
      {imageIcon && (
        <span className="common_btn_icon">
          <img fetchPriority="high" src={imageIcon} alt="" />
        </span>
      )}
      {title}
      {isLoading ? <Spinner /> : text}
      {children}
    </button>
  );
};

export default CommonButton;
