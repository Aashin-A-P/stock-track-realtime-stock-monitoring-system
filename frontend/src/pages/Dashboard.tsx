// pages/Dashboard.tsx
import React, { useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDashboard } from "../context/DashboardContext"; 
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import YearDropdown from "../components/YearDropdown";
import LoadingSpinner from "../components/LoadingSpinner";

// Extend dayjs functionality for relative time
dayjs.extend(relativeTime);

// Register Chart.js components
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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, isLoading: authLoading } = useAuth();
  
  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const {
    analysisData,
    logs,
    years,
    loading: dashboardLoading,
    year,
    error: dashBoardError,
    fetchData,
    setYear,
  } = useDashboard();

  // Handle year change
  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear);
    fetchData(selectedYear);
  };

  // Function to generate blue shades for pie chart
  const generateBlueShades = (count: number) =>
    Array.from({ length: count }, (_, idx) => `hsl(${220 + idx * 10}, 70%, 60%)`);

  // Pie chart data for available vs. used budget
  const pieChartData1 = {
    labels: ["Available", "Used"],
    datasets: [
      {
        data: [
          (analysisData?.totalBudget || 0) - (analysisData?.totalSpent || 0),
          analysisData?.totalSpent || 0,
        ],
        backgroundColor: ["#4B6EAF", "#2C3E50"],
      },
    ],
  };

  // Pie chart data for category spending
  const pieChartData2 = {
    labels: analysisData?.categorySpent.map((data) => data.category),
    datasets: [
      {
        data: analysisData?.categorySpent.map((data) => data.spent),
        backgroundColor: generateBlueShades(analysisData?.categorySpent.length || 0),
      },
    ],
  };

  // Line chart data for monthly spending
  const lineChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: `Monthly Spendings for ${analysisData?.totalBudget}`,
        data: analysisData?.monthlySpent,
        borderColor: "#3498DB",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  // For auth-related loading we block the entire page
  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-8">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-8">Dashboard</h2>

        {/* Year Selector */}
        <div className="flex justify-end mb-6">
          <YearDropdown selectedYear={year} onSelectYear={handleYearChange} years={years} />
        </div>

        {/* Overview Section */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Budget Card */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Total Budget</h3>
            {dashBoardError && <p className="text-red-500 mb-2">{dashBoardError}</p>}
            {dashboardLoading || !analysisData ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="text-3xl font-semibold text-gray-900 mb-4">
                  ₹{analysisData.totalBudget.toLocaleString()}
                </div>
                <Pie data={pieChartData1} />
              </>
            )}
          </div>

          {/* Total Spent Card */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Total Spent</h3>
            {dashBoardError && <p className="text-red-500 mb-2">{dashBoardError}</p>}
            {dashboardLoading || !analysisData ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="text-3xl font-semibold text-gray-900 mb-4">
                  ₹{analysisData.totalSpent.toLocaleString()}
                </div>
                <Pie data={pieChartData2} />
              </>
            )}
          </div>

          {/* Monthly Spendings Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6 hidden col-span-2 md:block">
            <h3 className="text-xl font-medium text-gray-800 text-center mb-4">Monthly Spendings</h3>
            {dashBoardError && <p className="text-red-500 mb-2 text-center">{dashBoardError}</p>}
            {dashboardLoading || !analysisData ? (
              <LoadingSpinner />
            ) : (
              <div className="h-64">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Recent Logs Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">Recent Logs</h3>
          {dashBoardError && <p className="text-red-500 mb-2">{dashBoardError}</p>}
          {dashboardLoading || !logs ? (
            <LoadingSpinner />
          ) : (
            <ul className="space-y-4">
              {logs.map((log) => (
                <li key={log.logId} className="text-gray-700">
                  {log.description} -{" "}
                  <span className="text-gray-500">
                    {dayjs(log.createdAt).fromNow()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
