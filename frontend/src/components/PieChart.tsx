import React from "react";
import { Pie } from "react-chartjs-2";

type PieChartProps = {
  data: any; // Chart.js data object
  title: string; // Chart title
};

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  return (
    <div className="chart">
      <h4>{title}</h4>
      <Pie data={data} />
    </div>
  );
};

export default PieChart;
