import React, { useState, useRef } from "react";

interface YearDropdownProps {
  onSelectYear: (year: number) => void;
  years: number[];
  selectedYear: number | null;
}

const YearDropdown: React.FC<YearDropdownProps> = ({
  onSelectYear,
  years,
  selectedYear,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Manage dropdown open/close state
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Reference to the dropdown

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen); // Toggle dropdown visibility
  };

  const handleSelectYear = (year: number) => {
    onSelectYear(year); // Handle year selection
    setIsOpen(false); // Close the dropdown after selecting a year
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the blur event is triggered outside the dropdown
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget as Node)) {
      setIsOpen(false); // Close the dropdown if focus is lost
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} onBlur={handleBlur}>
      {/* Dropdown button */}
      <button
        onClick={handleToggleDropdown}
        className="inline-flex justify-between items-center w-40 px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-200 transition duration-200 ease-in-out"
      >
        {selectedYear ? selectedYear : "Select Year"}
        <svg
          className={`ml-2 w-5 h-5 transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white border border-blue-200 focus:outline-none">
          <div className="py-1">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => handleSelectYear(year)}
                className="block w-full text-left px-4 py-2 text-sm text-blue-900 hover:bg-blue-100 focus:bg-blue-200 focus:outline-none transition ease-in-out"
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YearDropdown;
