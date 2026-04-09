import { type ReactNode } from "react";
import { Form } from "react-bootstrap";
// import { CloseEyeIcon, OpenEyeIcon } from "../../../assets/icons/svgIcon";
import ErrorComponent from "../errorComponent/ErrorComponent";
import { createTrimOnBlurHandler } from "../utils/trimInputValue";
import "../FormControl.scss";
import "./searchField.scss";
interface InputFieldProps {
  label?: ReactNode;
  name?: string;
  type?: string;
  placeholder?: string;
  error?: ReactNode;
  className?: string;
  value?: string;
  disabled?: boolean;
  leftText?: ReactNode;
  maxLength?: number;
  disableDecimal?: boolean;
  righttextOnclick?: () => void;
  bottomTitle?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
  onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  trimOnBlur?: boolean;
}
const SearchField: React.FC<InputFieldProps> = ({
  maxLength,
  label,
  name,
  type,
  placeholder,
  error,
  className,
  value,
  bottomTitle,
  leftText,
  righttextOnclick,
  disabled = false,
  onChange,
  onBlur,
  onWheel,
  onPaste,
  disableDecimal,
  readOnly = false,
  trimOnBlur = true,
}) => {
  const handleBlur = createTrimOnBlurHandler(
    type,
    { trimOnBlur, disabled, readOnly },
    onChange,
    onBlur
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type == "number" && ["e", "-"].includes(e.key)) {
      e.preventDefault();
    }
    if (disableDecimal && e.key == ".") {
      e.preventDefault();
    }
  };
  return (
    <div
      className={`input_group ${className ?? ""}`}
    >
      {label && <Form.Label htmlFor={name}>{label}</Form.Label>}
      <div className="input_group_inner">
        <Form.Control
          type={type ? type : "text"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          isInvalid={!!error}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          onWheel={onWheel}
          onPaste={onPaste}
          onKeyDown={handleKeyDown}
        />

        {leftText && (
          <h5
            className="input_group_inner_leftText"
            onClick={righttextOnclick}
          >
            {leftText}
          </h5>
        )}
      </div>
      <ErrorComponent error={error} />
      {bottomTitle && (
        <div className="input_group_btm_title">{bottomTitle}</div>
      )}
    </div>
  );
};
export default SearchField;
