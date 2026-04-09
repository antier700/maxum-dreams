import {
  DateTimePicker,
  DateTimePickerChangeEvent,
} from "@progress/kendo-react-dateinputs";
import { ReactNode } from "react";
import ErrorComponent from "../errorComponent/ErrorComponent";
import "./DatePickerr.scss";

type Props = {
  value?: Date;
  label?: string;
  name?: string;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (value: DateTimePickerChangeEvent) => void;
  error?: ReactNode;
  className?: string;
  parentClass?: string;
  placeholder?: string;
  disabled?: boolean;
};

const DateTimePickerr = ({
  value,
  label,
  name,
  minDate,
  maxDate,
  onChange,
  error,
  parentClass,
}: Props) => {
  return (
    <div className={`common_datetime input_group ${parentClass || ""}`}>
      {label && <label htmlFor={name}>{label}</label>}
      <div className="common_datetime_wrapper">
        <DateTimePicker
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          min={minDate}
          max={maxDate}
          placeholder="mm/dd/yy hh:mm:ss"
          formatPlaceholder={{
            year: "yy",
            month: "mm",
            day: "dd",
            hour: "hh",
            minute: "mm",
            second: "ss",
          }}
        />
      </div>
      <ErrorComponent error={error} />
    </div>
  );
};

export default DateTimePickerr;
