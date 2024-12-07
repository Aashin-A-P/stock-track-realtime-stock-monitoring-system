import React from "react";

type AmountTitleBarProps = {
  amount: number;
  title: string;
  bgColor: string;
};

const AmountTitleBar: React.FC<AmountTitleBarProps> = ({ amount, title, bgColor }) => {
  return (
    <div
      className={`text-center p-6 ${bgColor} text-white rounded-lg shadow-lg mb-6 transition duration-300 ease-in-out hover:scale-105`}
    >
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-2xl font-bold">{`₹${amount.toLocaleString()}`}</p>
    </div>
  );
};

export default AmountTitleBar;
