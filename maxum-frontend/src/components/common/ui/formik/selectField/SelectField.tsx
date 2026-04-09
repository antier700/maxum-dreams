import { useState, ReactNode, FocusEventHandler } from 'react';
import Select, {
  components,
  GroupBase,
  OptionProps,
  SingleValueProps,
} from 'react-select';

import ErrorComponent from '../errorComponent/ErrorComponent';
import '../FormControl.scss';
import './SelectField.scss';

interface Option {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectFieldProps {
  name: string;
  label?: ReactNode;
  value?: string;
  options?: Option[];
  error?: ReactNode;
  placeholder?: string;
  className?: string;
  menuIsOpen?: boolean;
  isClearable?: boolean;
  onChange?: (option: Option | null) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  labelText?: string;

}

const CustomOption = (props: OptionProps<Option, false, GroupBase<Option>>) => (
  <components.Option {...props}>
    {props.data.icon && <span className="option-icon">{props.data.icon}</span>}
    {props.children}
  </components.Option>
);

const CustomSingleValue = (
  props: SingleValueProps<Option, false, GroupBase<Option>>
) => (
  <components.SingleValue {...props}>
    {props.data.icon && <span className="icon">{props.data.icon}</span>}
    {props.children}
  </components.SingleValue>
);

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  options = [],
  error,
  placeholder,
  className = '',
  menuIsOpen,
  isClearable = false,
  onChange,
  onBlur,
  labelText
}) => {
  const initialSelected = options.find((option) => option.value === value) || null;
  const [selectedOption, setSelectedOption] = useState<Option | null>(initialSelected);

  const handleChange = (selected: Option | null) => {
    setSelectedOption(selected);
    onChange?.(selected);
  };

  const hasError = !!error;

  return (
    <div className={`input_group common_select ${className} ${hasError ? 'has-error' : ''}`}>
      {labelText && <span>{labelText}</span>}
      {label && <label htmlFor={name}>{label}</label>}
      <Select<Option, false, GroupBase<Option>>
        name={name}
        instanceId={name}
        options={options}
        classNamePrefix="form"
        value={selectedOption}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder || `Select ${label}`}
        isClearable={isClearable}
        menuIsOpen={menuIsOpen}
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
        }}
        styles={{
          indicatorSeparator: () => ({ display: 'none' }),
        }}
      />

      <ErrorComponent error={error} />
    </div>
  );
};

export default SelectField;
