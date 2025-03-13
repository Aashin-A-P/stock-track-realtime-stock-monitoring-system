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
    labels: analysisData?.map(data => data.budgetName),
    datasets: [
      {
        data: analysisData?.map(data => data.totalBudget - data.totalSpent),
        backgroundColor: generateBlueShades(analysisData?.length || 0),
      },
      {
        data: analysisData?.map(data => data.totalSpent),
        backgroundColor: generateBlueShades(analysisData?.length || 0).map(color => color.replace('60%', '40%')),
      },
    ],
  };

  // Pie chart data for category spending
  const pieChartData2 = {
    labels: analysisData?.flatMap(data => data.categorySpent.map(category => `${data.budgetName} - ${category.category}`)),
    datasets: [
      {
        data: analysisData?.flatMap(data => data.categorySpent.map(category => category.spent)),
        backgroundColor: generateBlueShades(analysisData?.flatMap(data => data.categorySpent).length || 0),
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
    datasets: analysisData
      ? analysisData.map(data => ({
        label: `${data.budgetName} - Monthly Spendings`,
        data: data.monthlySpent,
        borderColor: generateBlueShades(analysisData.length).shift(),
        tension: 0.4,
        fill: false,
      }))
      : [],
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
                  ₹{analysisData.reduce((acc, data) => acc + Number(data.totalBudget), 0).toFixed(2).toLocaleString()}
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
                  ₹{analysisData.reduce((acc, data) => acc + Number(data.totalSpent), 0).toFixed(2).toLocaleString()}
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
