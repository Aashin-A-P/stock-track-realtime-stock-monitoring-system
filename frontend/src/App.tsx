import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import "./App.css";

// Register Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend);

const App = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState<Number>(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/dashboard/analysis?year=2022", {headers: { 'Content-Type': 'application/json', 'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTc1NTA4NywiZXhwIjoxNzM0MzQ3MDg3fQ.Wr3ZKYdBjDc-7QBNWWKXa6QRqavG2QcNx3X3sm5UBlM' }, mode: "cors"});
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setAnalysisData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Accessing the `message` property safely
        } else {
          setError("An unknown error occurred."); // Fallback for non-Error objects
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const pieChartData1 = {
    labels: ["Available", "Used"],
    datasets: [
      {
        data: [analysisData.totalBudget-analysisData.totalSpent, analysisData.totalSpent],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const pieChartData2 = {
    labels: analysisData.categorySpent.map((data) => data.category ),
    datasets: [
      {
        data: analysisData.categorySpent.map((data) => data.spent),
        backgroundColor: ["#FFCE56", "#4BC0C0", "#FF6384"],
        hoverBackgroundColor: ["#FFCE56", "#4BC0C0", "#FF6384"],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Stock Management</h3>
        <ul>
          <li>Add Stock</li>
          <li>Search Stock</li>
          <li>Logs</li>
          <li>User Management</li>
          <li>Report Generation</li>
        </ul>
      </div>
      <div className="main-content">
        <h2>Dashboard</h2>
        <div className="charts">
          <div className="chart">
            <h4>Stock Status <span>Total Budget: {analysisData.totalBudget}</span></h4>
            <Pie data={pieChartData1} />
          </div>
          <div className="chart">
            <h4>Department Distribution</h4>
            <Pie data={pieChartData2} />
          </div>
        </div>
        <div className="analysis">
          <h4>Analysis Data</h4>
          <pre>{JSON.stringify(analysisData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default App;
