import type { ReactNode } from "react";
import DatePickerr from "./datepickerr/DatePickerr";
import DateTimePickerr from "./datepickerr/DateTimePickerr";
import InputField from "./inputField/InputField";
import SelectField from "./selectField/SelectField";
import TextareaField from "./textareaField/TextareaField";
import PhoneInputField from "./phone/PhoneInputField";
import './FormControl.scss';

interface FormControlProps {
  control?: string;
  name: string;
  error?: ReactNode;
  [key: string]: unknown;
}
const FormControl: React.FC<FormControlProps> = ({ control, error, ...props }) => {
  switch (control) {
    case 'select':
      return <SelectField {...props} error={error} />;
    case "date":
      return <DatePickerr {...props} error={error} />;
    case "datetime":
      return <DateTimePickerr {...props} error={error} />;
    case "textarea":
      return <TextareaField {...props} error={error} />;
    case "phone-input":
      return <PhoneInputField {...props} error={error} />;
    default:
      return <InputField {...props} error={error} />;
  }
};
export default FormControl;
