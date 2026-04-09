import { ReactNode, useId } from "react";
import { Form } from 'react-bootstrap';
import ErrorComponent from "../errorComponent/ErrorComponent";
import './checkboxField.scss';

interface CheckboxFieldProps {
    label?: ReactNode;
    secondaryLabel?: ReactNode;
    name?: string;
    error?: ReactNode;
    className?: string;
    value?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
    label,
    secondaryLabel,
    name,
    error,
    className,
    value,
    onChange,
    onBlur
}) => {
    const id = useId();

    return (
        <div className={`common_checkbox ${className}`}>
            <Form.Check
                type="checkbox"
                id={id}
                label={<div className="label_box">
                    {label && <div className="label">{label}</div>}
                    {secondaryLabel && <div className="secondary_label">{secondaryLabel}</div>}
                </div>
                }
                name={name}
                checked={value}
                onChange={onChange}
                onBlur={onBlur}
                isInvalid={!!error}
            />
            <ErrorComponent error={error} />
        </div>
    );
};

export default CheckboxField;
