import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import Dropdown from "react-bootstrap/Dropdown";

type AnalysisData = {
  totalBudget: number;
  totalSpent: number;
  categorySpent: { category: string; spent: number }[];
};

// Register Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
    const [analysisData, setAnalysisData] = useState<AnalysisData|null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [year, setYear] = useState(new Date().getFullYear()-1);
  
    const fetchData = async (selectedYear: number) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `http://localhost:3000/dashboard/analysis?year=${selectedYear}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": localStorage.getItem("token") || ""
            },
            mode: "cors",
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setAnalysisData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch data whenever `year` changes
    useEffect(() => {
      fetchData(year);
    }, [year]);
  
    if (loading) {
        return <div className="spinner-border m-5" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    }
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    const handleYearSelect = (selectedYear: number) => {
      setYear(selectedYear);
    };
    if (!analysisData) {
      return <div>No data available</div>;
    }

    const pieChartData1 = {
      labels: ["Available", "Used"],
      datasets: [
        {
          data: [
            analysisData.totalBudget - analysisData.totalSpent,
            analysisData.totalSpent,
          ],
          backgroundColor: ["#36A2EB", "#FF6384"],
          hoverBackgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    };
  
    const pieChartData2 = {
      labels: analysisData.categorySpent.map((data) => data.category),
      datasets: [
        {
          data: analysisData.categorySpent.map((data) => data.spent),
          backgroundColor: ["#FFCE56", "#4BC0C0", "#FF6384"],
          hoverBackgroundColor: ["#FFCE56", "#4BC0C0", "#FF6384"],
        },
      ],
    };
  
    return (
        <div className="main-content">
          <h2>Dashboard</h2>
          <div className="charts">
            <div className="chart">
              <h4>
                Stock Status <span>Total Budget: {analysisData.totalBudget}</span>
                <Dropdown onSelect={(eventKey) => handleYearSelect(Number(eventKey))}>
                  <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {year ? year:"Select Year"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {[2019, 2020, 2021, 2022, 2023].map((y) => (
                      <Dropdown.Item key={y} eventKey={y}>
                        {y}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </h4>
  
              <Pie data={pieChartData1} />
            </div>
            <div className="chart">
              <h4>Department Distribution</h4>
              <Pie data={pieChartData2} />
            </div>
          </div>
          <br /><br />
          
          <div className="list-group">
          <h3>Logs</h3>
  <a href="#" className="list-group-item list-group-item-action active" aria-current="true">
    <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">List group item heading</h5>
      <small>3 days ago</small>
    </div>
    <p className="mb-1">Some placeholder content in a paragraph.</p>
    <small>And some small print.</small>
  </a>
  <a href="#" className="list-group-item list-group-item-action">
    <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">List group item heading</h5>
      <small className="text-body-secondary">3 days ago</small>
    </div>
    <p className="mb-1">Some placeholder content in a paragraph.</p>
    <small className="text-body-secondary">And some muted small print.</small>
  </a>
  <a href="#" className="list-group-item list-group-item-action">
    <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">List group item heading</h5>
      <small className="text-body-secondary">3 days ago</small>
    </div>
    <p className="mb-1">Some placeholder content in a paragraph.</p>
    <small className="text-body-secondary">And some muted small print.</small>
  </a>
</div>
        </div>

    );
}

export default Dashboard;