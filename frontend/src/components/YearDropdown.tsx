import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

interface YearDropdownProps {
  onSelectYear: (year: number) => void;
  years: number[];
}

const YearDropdown: React.FC<YearDropdownProps> = ({ onSelectYear, years }) => {
  return (
    <Dropdown onSelect={(eventKey) => onSelectYear(Number(eventKey))}>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        Select Year
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {years.map((year) => (
          <Dropdown.Item key={year} eventKey={year}>
            {year}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default YearDropdown;
