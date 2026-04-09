import { ReactNode } from "react";
import './CustomInput.scss';

interface DropdownProps {
    label: string;
    placeholder?: string;
    rightContent?: ReactNode;
    value?: string;
    onChange?: () => void;
}
const CustomInput: React.FC<DropdownProps> = ({
    label,
    rightContent,
    placeholder, 
    value,
    onChange,
    ...rest
}) => {
    return (
        <div className="custom_input">
            <div className="custom_input_label">
                <span>{label}</span>
            </div>
            <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="custom_input_field" {...rest} />
            {rightContent && <div className="custom_input_cta">
                {rightContent}
            </div>
}
        </div>
    )
}

export default CustomInput