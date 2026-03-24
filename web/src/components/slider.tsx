import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import './slider.css';

export default function DateSlider({ maxValue = 84, onSliderChange }: { maxValue?: number; onSliderChange: (value: [Date, Date]) => void }) {
    const [currentMax, setCurrentMax] = useState(maxValue);
    const [marks, setMarks] = useState([{ value: 0, label: '' }]);
    const [numValue, setNumValue] = useState([0, 28]);
    useEffect(() => {
        setCurrentMax(maxValue);
        // Generate marks based on maxValue, e.g., every 7 units
        const today = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const newMarks = Array.from({ length: Math.floor(maxValue / 7) + 1 }, (_, i) => {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i * 7);
            const day = futureDate.getDate().toString().padStart(2, '0');
            const monthName = months[futureDate.getMonth()];
            const label = i === 0 ? 'Today' : `${day} ${monthName}`;
            return {
                value: i * 7,
                label
            };
        });
        setMarks(newMarks);
    }, [maxValue]);

    const today = new Date();

    const handleChange = (event: Event, newValue: number[]) => {
        setNumValue(newValue);
        if (onSliderChange && Array.isArray(newValue)) {
            const dates = newValue.map(num => {
                const date = new Date();
                date.setDate(today.getDate() + num);
                return date;
            });
            onSliderChange(dates as [Date, Date]);
        }
    };

    return (
        <Slider
            value={numValue}
            onChange={handleChange}
            aria-label="Default"
            valueLabelDisplay="off"
            marks={marks}
            step={7}
            max={currentMax}
        />
    );
}