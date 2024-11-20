import React from "react";

type TotalBudgetProps = {
  totalBudget: number;
};

const TotalBudget: React.FC<TotalBudgetProps> = ({ totalBudget }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#36A2EB",
        color: "white",
        borderRadius: "8px",
        margin: "10px",
        marginBottom: "20px"
      }}
    >
      <h4>Total Budget</h4>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>{`₹${totalBudget.toLocaleString()}`}</p>
    </div>
  );
};

export default TotalBudget;
