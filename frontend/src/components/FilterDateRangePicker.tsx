import React from "react";

interface FilterDateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const FilterDateRangePicker: React.FC<FilterDateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const handleStartDateSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onStartDateChange(event.target.value);
  };

  const handleEndDateSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEndDateChange(event.target.value);
  };

  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white flex space-x-4">
      <div className="flex-1">
        <label
          htmlFor="start-date"
          className="block font-medium mb-2 text-gray-700"
        >
          Start Date
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate || ""}
          onChange={handleStartDateSelect}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex-1">
        <label
          htmlFor="end-date"
          className="block font-medium mb-2 text-gray-700"
        >
          End Date
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate || ""}
          onChange={handleEndDateSelect}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default FilterDateRangePicker;
