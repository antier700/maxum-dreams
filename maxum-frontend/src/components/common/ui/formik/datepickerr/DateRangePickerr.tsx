// import { ReactNode, useState } from "react";
// import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
// import "react-calendar/dist/Calendar.css";
// import DateRangePicker from "@wojtekmaj/react-daterange-picker";
// import "./DatePickerr.scss";

// type ValuePiece = Date | null;
// type DateValue = [ValuePiece, ValuePiece] | null;

// interface DateRangeProps {
//   value?: DateValue;
//   label?: string;
//   name?: string;
//   calendarIcon?: ReactNode;
//   rangeDividerIcon?: ReactNode;
//   minDate?: Date;
//   maxDate?: Date;
//   className?: string;
//   parentClass?: string;
//   placeholder?: string;
//   defaultStartDate?: Date; // New prop for default start date
//   defaultEndDate?: Date; // New prop for default end date
//   onChange?: (value: DateValue) => void;
// }

// const DateRangePickerr: React.FC<DateRangeProps> = ({
//   value,
//   label,
//   name,
//   calendarIcon,
//   rangeDividerIcon = "→",
//   minDate,
//   maxDate,
//   className,
//   parentClass,
//   placeholder,
//   defaultStartDate, // Receiving default start date
//   defaultEndDate, // Receiving default end date
//   onChange,
// }) => {
//   // Initialize state with default start and end dates if provided
//   const [dateRange, setDateRange] = useState<DateValue>(
//     value || [defaultStartDate || null, defaultEndDate || null]
//   );

//   const handleChange = (newDate: DateValue) => {
//     setDateRange(newDate);
//     if (onChange) onChange(newDate);
//   };

//   return (
//     <div className={`common_datetime input_group ${parentClass}`}>
//       {label && <label>{label}</label>}
//       <div className={`common_datetime_wrapper ${dateRange ? "has-value" : "no-value"}`}>
//         {!dateRange?.[0] && !dateRange?.[1] && <span className="placeholder-text">{placeholder}</span>}
//         <DateRangePicker
//           onChange={(newDate) => handleChange(newDate as DateValue)}
//           value={dateRange}
//           name={name}
//           minDate={minDate}
//           maxDate={maxDate}
//           format="dd/MM/y"
//           className={className}
//           calendarIcon={calendarIcon}
//           rangeDivider={rangeDividerIcon}
//         />
//       </div>
//     </div>
//   );
// };

// export default DateRangePickerr;
