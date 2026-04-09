"use client";
import { useState, type ReactNode } from "react";
import { Form } from "react-bootstrap";
import ErrorComponent from "../errorComponent/ErrorComponent";
import "../FormControl.scss";
import "./InputField.scss";
import { CloseEyeIcon, OpenEyeIcon } from "@/assets/icons/svgIcon";
import {
  createTrimOnBlurHandler,
  flushTrimOnEnterKey,
  handleGlobalKeyFilter,
} from "../utils/trimInputValue";

interface InputFieldProps {
  label?: ReactNode;
  name?: string;
  type?: string;
  placeholder?: string;
  error?: ReactNode;
  className?: string;
  value?: string;
  disabled?: boolean;
  righttext?: ReactNode;
  maxLength?: number;
  disableDecimal?: boolean;
  righttextOnclick?: () => void;
  bottomTitle?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
  onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  gradientText?: boolean;
  readOnly?: boolean;
  /** When true (default), trims value on blur for text-like inputs (not password). */
  trimOnBlur?: boolean;
  onInput?: (e: React.InputEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  maxLength,
  label,
  name,
  type,
  placeholder,
  error,
  className,
  value,
  bottomTitle,
  righttext,
  righttextOnclick,
  disabled = false,
  onChange,
  onBlur,
  onWheel,
  onPaste,
  disableDecimal,
  children: chlidren,
  gradientText = false,
  readOnly = false,
  trimOnBlur = true,
  onInput,
}) => {
  const [active, setActive] = useState(true);
  const handleTogglePassword = () => {
    setActive(!active);
  };
  const inputType =
    type === "password" ? (active ? "password" : "text") : type || "text";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block HTML-injection characters globally (except password fields)
    if (handleGlobalKeyFilter(e, type)) return;

    if (type === "number" && ["e", "-"].includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (disableDecimal && e.key === ".") {
      e.preventDefault();
      return;
    }

    // Flush trim so Enter-submit sees the trimmed value
    flushTrimOnEnterKey(e, type, { trimOnBlur, disabled, readOnly }, onChange);
  };

  const handleBlur = createTrimOnBlurHandler(
    type,
    { trimOnBlur, disabled, readOnly },
    onChange,
    onBlur
  );

  return (
    <div
      className={`input_group ${className ?? ""} ${type === "password" ? "passfield" : ""}`}
    >
      {label && <Form.Label htmlFor={name}>{label}</Form.Label>}
      <div className={`input_group_inner ${righttext ? "rightpadding" : ""}`}>
        <Form.Control
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          isInvalid={!!error}
          disabled={disabled}
          maxLength={maxLength}
          onWheel={onWheel}
          onPaste={onPaste}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          onInput={onInput}
        />
        {type === "password" ? (
          <button
            type="button"
            className="input_group_passbtn k"
            onClick={handleTogglePassword}
          >
            {active ? <CloseEyeIcon /> : <OpenEyeIcon />}
          </button>
        ) : (
          ""
        )}
        {righttext && (
          <h5
            className={`input_group_inner_righttext ${gradientText ? "gradient-text" : ""}`}
            onClick={righttextOnclick}
          >
            {righttext}
          </h5>
        )}
      </div>
      <ErrorComponent error={error} />
      {bottomTitle && (
        <div className="input_group_btm_title">{bottomTitle}</div>
      )}
      {chlidren}
    </div>
  );
};
export default InputField;
