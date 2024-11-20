import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

type YearSelectorProps = {
  year: number;
  handleYearSelect: (year: number) => void;
  years: number[];
};

const YearSelector: React.FC<YearSelectorProps> = ({ year, handleYearSelect, years }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#FFCE56",
        color: "white",
        borderRadius: "8px",
        margin: "10px",
      }}
    >
      <h4>Select Year</h4>
      <Dropdown onSelect={(eventKey) => handleYearSelect(Number(eventKey))}>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          {year === 0 ? "Select Year" : year}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {years.map((y) => (
            <Dropdown.Item key={y} eventKey={y}>
              {y}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default YearSelector;
