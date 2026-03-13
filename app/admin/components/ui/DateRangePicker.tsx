'use client';

import { 
  DateRangePicker as AriaDateRangePicker, 
  DateInput, 
  DateSegment, 
  Dialog, 
  Group, 
  Label, 
  Popover, 
  Button, 
  RangeCalendar, 
  CalendarGrid, 
  CalendarCell, 
  Heading,
  CalendarGridHeader,
  CalendarHeaderCell
} from 'react-aria-components';
import { CalendarIcon, ChevronLeft, ChevronRight } from '@untitledui/icons';
import type { DateValue } from '@internationalized/date';

interface DateRangeValue {
  start: DateValue;
  end: DateValue;
}

interface DateRangePickerProps {
  label?: string;
  value?: DateRangeValue | null;
  onChange?: (value: DateRangeValue | null) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  description?: string;
  errorMessage?: string;
}

export default function DateRangePicker({
  label,
  value,
  onChange,
  isRequired,
  isDisabled,
  minValue,
  maxValue,
  description,
  errorMessage,
}: DateRangePickerProps) {
  return (
    <AriaDateRangePicker
      value={value}
      onChange={onChange}
      isRequired={isRequired}
      isDisabled={isDisabled}
      minValue={minValue}
      maxValue={maxValue}
      className="flex flex-col gap-2"
    >
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <Group className="relative inline-flex items-center gap-2 w-full">
        <DateInput
          slot="start"
          className="flex-1 flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 transition-all"
        >
          {(segment) => (
            <DateSegment
              segment={segment}
              className="px-0.5 tabular-nums outline-none rounded focus:bg-blue-600 focus:text-white"
            />
          )}
        </DateInput>
        
        <span className="text-gray-500">–</span>
        
        <DateInput
          slot="end"
          className="flex-1 flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 transition-all"
        >
          {(segment) => (
            <DateSegment
              segment={segment}
              className="px-0.5 tabular-nums outline-none rounded focus:bg-blue-600 focus:text-white"
            />
          )}
        </DateInput>
        
        <Button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <CalendarIcon className="w-5 h-5" />
        </Button>
      </Group>

      {description && !errorMessage && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      
      {errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <Popover className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <Dialog className="outline-none">
          <RangeCalendar className="w-full">
            <header className="flex items-center justify-between mb-4">
              <Button
                slot="previous"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Heading className="text-sm font-semibold text-gray-900" />
              <Button
                slot="next"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </header>
            <CalendarGrid className="border-spacing-1">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-xs font-medium text-gray-600">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              {(date) => (
                <CalendarCell
                  date={date}
                  className="w-9 h-9 text-sm outline-none cursor-pointer rounded-lg flex items-center justify-center hover:bg-gray-100 selected:bg-blue-600 selected:text-white selection-start:rounded-l-lg selection-end:rounded-r-lg disabled:text-gray-300 disabled:cursor-not-allowed outside-month:text-gray-400"
                />
              )}
            </CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  );
}
