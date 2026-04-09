// RangeSlider.tsx
import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import './RangeSlider.scss';

type RangeSliderProps = {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange?: (value: number) => void;
    className?: string;
};

const RangeSlider = ({
    min = 0,
    max = 100,
    step,
    value,
    onChange,
    className = ''
}: RangeSliderProps) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number>(value ?? min);

    useEffect(() => {
        if (isControlled && value !== internalValue) {
            setInternalValue(value);
        }
    }, [value]);

    const handleSliderChange = (newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            if (!isControlled) setInternalValue(newValue);
            onChange?.(newValue);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= min && val <= max) {
            if (!isControlled) setInternalValue(val);
            onChange?.(val);
        }
    };

    return (
        <div className={`progress-container ${className}`}>
            <div className="slider-wrapper">
                <Slider
                    min={min}
                    max={max}
                    step={step}
                    dots={true}
                    value={internalValue}
                    onChange={handleSliderChange}
                />
            </div>
            <div className="input-wrapper">
                <input
                    type="number"
                    min={min}
                    max={max}
                    value={internalValue}
                    onChange={handleInputChange}
                />
                <span>%</span>
            </div>
        </div>
    );
};

export default RangeSlider;
