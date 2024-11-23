import React, { useEffect, useState } from "react";
import TotalBudget from "../components/TotalBudget";
import TotalSpend from "../components/TotalSpend";
import YearSelector from "../components/YearSelector";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

// Load the relativeTime plugin
dayjs.extend(relativeTime);

// Register Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

type AnalysisData = {
  totalBudget: number;
  totalSpent: number;
  categorySpent: { category: string; spent: number }[];
  monthlySpent: number[];
};

type LogData = {
  logId: number;
  description: string;
  createdAt: Date;
}

function Dashboard() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(0);
  const [years, setYears] = useState([]);
  const [logs, setLogs] = useState<LogData[]>([]);

  const fetchData = async (selectedYear: number) => {
    setLoading(true);
    setError("");
    try {
      //Selected Year data
      if(selectedYear !== 0){
        const response = await fetch(
          `http://localhost:3000/dashboard/analysis?year=${selectedYear}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token") || "",
            },
            mode: "cors",
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setAnalysisData(result);
      } else {
        
      //All Year Analysis

      const totalAnalysisDataresponse = await fetch(
        `http://localhost:3000/dashboard/all-years-analysis`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") || "",
          },
          mode: "cors",
        }
      );
      if (!totalAnalysisDataresponse.ok) {
        throw new Error(`HTTP error! Status: ${totalAnalysisDataresponse.status}`);
      }
      const totalAnalysisDataresult = await totalAnalysisDataresponse.json();
      setAnalysisData({ ...totalAnalysisDataresult, monthlySpent:[] });
      }

      //Years Array

      const yearsResponse = await fetch(
        `http://localhost:3000/dashboard/budget-years`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") || "",
          },
          mode: "cors",
        }
      );
      if (!yearsResponse.ok) {
        throw new Error(`HTTP error! Status: ${yearsResponse.status}`);
      }
      const { years } = await yearsResponse.json();
      setYears(years);

      // get logs data
      const logsResponse = await fetch(
        `http://localhost:3000/dashboard/recent-logs?numberOfLogs=5`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") || "",
          },
          mode: "cors",
        }
      );
      if (!logsResponse.ok) {
        throw new Error(`HTTP error! Status: ${logsResponse.status}`);
      }
      const logs = await logsResponse.json();
      setLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(year);
  }, [year]);

  if (loading) {
    return (
      <div className="spinner-border m-5" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
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
        data: [analysisData.totalBudget - analysisData.totalSpent, analysisData.totalSpent],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const colorPalette = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33FFF6", "#FFC300", "#DAF7A6", "#581845",
    "#900C3F", "#C70039", "#FFC0CB", "#40E0D0", "#800080", "#FFD700", "#FFA500", "#7FFF00",
    "#DC143C", "#00FFFF", "#0000FF", "#A52A2A", "#8A2BE2", "#5F9EA0", "#7FFF00", "#D2691E",
    "#FF7F50", "#6495ED", "#DC143C", "#00FFFF", "#00008B", "#008B8B", "#B8860B", "#A9A9A9",
    "#006400", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00", "#9932CC", "#8B0000", "#E9967A",
    "#8FBC8F", "#483D8B", "#2F4F4F", "#00CED1", "#9400D3", "#FF1493", "#00BFFF", "#696969",
    "#1E90FF", "#B22222", "#FFFAF0", "#228B22", "#FF00FF", "#DCDCDC", "#F8F8FF", "#FFD700",
    "#DAA520", "#808080", "#008000", "#ADFF2F", "#F0FFF0", "#FF69B4", "#CD5C5C", "#4B0082",
    "#FFFFF0", "#F0E68C", "#E6E6FA", "#FFF0F5", "#7CFC00", "#FFFACD", "#ADD8E6", "#F08080",
    "#E0FFFF", "#FAFAD2", "#90EE90", "#D3D3D3", "#FFB6C1", "#FFA07A", "#20B2AA", "#87CEFA",
    "#778899", "#B0C4DE", "#FFFFE0", "#00FF00", "#32CD32", "#FAF0E6", "#FF00FF", "#800000",
    "#66CDAA", "#0000CD", "#BA55D3", "#9370DB", "#3CB371", "#7B68EE", "#00FA9A", "#48D1CC",
    "#C71585", "#191970", "#FFE4E1", "#FFE4B5"
  ];
  
  const pieChartData2 = {
    labels: analysisData.categorySpent.map((data) => data.category),
    datasets: [
      {
        data: analysisData.categorySpent.map((data) => data.spent),
        backgroundColor: colorPalette.slice(0, analysisData.categorySpent.length),
        hoverBackgroundColor: colorPalette.slice(0, analysisData.categorySpent.length),
      },
    ],
  };

  const lineChartData = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: `Monthly Spendings for ${year}`,
        data: analysisData.monthlySpent,
        fill: false,
        borderColor: "#36A2EB",
        backgroundColor: "#36A2EB",
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div style={{ height: "100vh", overflowY: "auto", width: "100vw", padding: "10px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Dashboard</h2>
  
      {/* Flex container to arrange Total Budget, YearSelector, and Total Spend */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        
        {/* Total Budget and Pie Chart 1 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", marginRight: "10px" }}>
          <TotalBudget totalBudget={analysisData.totalBudget} />
          <div style={{ maxWidth: "300px", margin: "auto" }}>
            <h4 style={{ textAlign: "center" }}>Stock Status</h4>
            <Pie data={pieChartData1} />
          </div>
        </div>
  
        {/* Year Selector */}
        <div style={{ width: "200px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <YearSelector year={year} handleYearSelect={setYear} years={years} />
        </div>
  
        {/* Total Spend and Pie Chart 2 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", marginLeft: "10px" }}>
          <TotalSpend totalSpent={analysisData.totalSpent} />
          <div style={{ maxWidth: "300px", margin: "auto" }}>
            <h4 style={{ textAlign: "center" }}>Department Distribution</h4>
            <Pie data={pieChartData2} />
          </div>
        </div>
      </div>
  
      {/* Line Chart */}
      <div style={{ width: "100%", height: "500px", marginBottom: "20px" }}>
        <h4 style={{ textAlign: "center" }}>Monthly Spendings</h4>
        <div style={{ width: "100%", height: "400px" }}>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>
  
      {/* Logs */}
      <div className="list-group">
  <h3>Logs</h3>
  {
    logs.map((log) => (
      <a 
        href="#" 
        key={log.logId} 
        className="list-group-item list-group-item-action active"
      >
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">Log {log.logId}</h5>
          <small>{dayjs(log.createdAt).fromNow()}</small>
        </div>
        <p className="mb-1">{log.description}.</p>
      </a>
    ))
  }
</div>

    </div>
  );
  
}


export default Dashboard;
