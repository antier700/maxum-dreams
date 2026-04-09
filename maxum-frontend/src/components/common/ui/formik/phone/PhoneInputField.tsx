import { ReactNode } from "react";
import { Form } from "react-bootstrap";
import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ErrorComponent from "../errorComponent/ErrorComponent";
import "./PhoneInputField.scss";
interface PhoneInputFieldProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  error?: ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  country?: string;
  inputStyle?: React.CSSProperties;
  countryCodeEditable?: boolean;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  className,
  disabled = false,
  country,
  inputStyle,
  countryCodeEditable,
}) => {
  return (
    <div className={`input_group phone ${className}`}>
      {label && <Form.Label htmlFor={name}>{label}</Form.Label>}
      <div className="input_group_inner">
        <ReactPhoneInput
          country={country}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          countryCodeEditable={countryCodeEditable}
          inputStyle={{ ...inputStyle, width: "100%" }}
        />
      </div>
      <ErrorComponent error={error} />
    </div>
  );
};

export default PhoneInputField;
