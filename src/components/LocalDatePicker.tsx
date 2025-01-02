// src/components/LocalDatePicker.tsx

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface LocalDatePickerProps {
  // Currently selected date
  selectedDate: Date | null;
  // Called when user picks a new date
  onDateChange: (date: Date | null) => void;
  // Array of "YYYY-MM-DD" strings to highlight
  highlightDates?: string[];
  // Optional max date or other props
  maxDate?: Date;
  className?: string;
  // Additional props to forward to ReactDatePicker
  [key: string]: any;
}

const LocalDatePicker: React.FC<LocalDatePickerProps> = ({
  selectedDate,
  onDateChange,
  highlightDates = [],
  maxDate,
  className,
  ...rest
}) => {
  /**
   * If today's date in 'YYYY-MM-DD' is in highlightDates, we apply
   * a red background for that day in the calendar.
   */
  const dayClassName = (date: Date): string => {
    const dateString = format(date, 'yyyy-MM-dd');
    return highlightDates.includes(dateString)
      ? 'react-datepicker__day--highlighted bg-red-300 text-white'
      : '';
  };

  const handleChange = (date: Date | null) => {
    onDateChange(date);
  };

  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={handleChange}
      maxDate={maxDate}
      dayClassName={dayClassName}
      className={className}
      {...rest}
    />
  );
};

export default LocalDatePicker;
