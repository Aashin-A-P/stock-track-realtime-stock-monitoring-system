import React from "react";

type TotalSpendProps = {
  totalSpent: number;
};

const TotalSpend: React.FC<TotalSpendProps> = ({ totalSpent }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#FF6384",
        color: "white",
        borderRadius: "8px",
        margin: "10px",
        marginBottom: "20px"
      }}
    >
      <h4>Total Spend</h4>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>{`₹${totalSpent.toLocaleString()}`}</p>
    </div>
  );
};

export default TotalSpend;
