import React, { useEffect } from 'react';
import OtpInput from 'react-otp-input';
import { Form } from 'react-bootstrap';
import './OtpField.scss';

interface OtpProps {
  value: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  className?: string;
  classLabel?: string;
  id?: string;
  shouldAutoFocus?: boolean;
  required?: boolean;
  numInputs?: number;
}

const OtpField = (props: OtpProps) => {
  const numInputs = props.numInputs || 6;
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text');
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length > 0) {
      props.onChange(digits.slice(0, numInputs));
    }
  };

  const handleChange = (newValue: string) => {
    const cleaned = newValue.replace(/[^0-9]/g, '').slice(0, numInputs);
    props.onChange(cleaned);
  };

  useEffect(() => {
    const cleaned = props.value.replace(/[^0-9]/g, '');
    if (cleaned !== props.value) {
      props.onChange(cleaned);
    }
  }, [props.value]);

  return (
    <div className={`OtpIputs ${props.className ?? ''}`}>
      {props.label && (
        <Form.Label htmlFor={props.id} className={props.classLabel}>
          {props.label}
          {props.required ? <span>*</span> : ''}
        </Form.Label>
      )}
      <OtpInput
        shouldAutoFocus={props.shouldAutoFocus}
        value={props.value}
        onChange={handleChange}
        numInputs={numInputs}
        renderInput={(inputProps: any) => (
          <input
            {...inputProps}
            onPaste={handlePaste}
            type="text"
            inputMode="numeric"
            placeholder="-"
          />
        )}
      />
    </div>
  );
};

export default OtpField;
