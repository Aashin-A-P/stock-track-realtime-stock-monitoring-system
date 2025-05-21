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

dayjs.extend(relativeTime);

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
    fetchData,
    setYear,
  } = useDashboard();

  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear);
    fetchData(selectedYear);
  };

  const generateBlueShades = (count: number) =>
    Array.from(
      { length: count },
      (_, idx) => `hsl(${220 + idx * 10}, 70%, 60%)`
    );

  const pieChartData1 = {
    labels: analysisData?.map((data) => data.budgetName),
    datasets: [
      {
        data: analysisData?.map((data) => data.totalBudget),
        backgroundColor: generateBlueShades(analysisData?.length || 0),
      },
    ],
  };

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
      ? analysisData.map((data, i) => ({
          label: `${data.budgetName} - Monthly Spendings`,
          data: data.monthlySpent,
          borderColor: generateBlueShades(analysisData.length)[i],
          tension: 0.4,
          fill: false,
        }))
      : [],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  if (authLoading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-4 md:px-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">
            Madras Institute of Technology
          </h1>
          <h2 className="text-lg font-semibold text-gray-600">
            Department of Information Technology
          </h2>
        </div>

        <div className="flex justify-end mb-6">
          <YearDropdown
            selectedYear={year}
            onSelectYear={handleYearChange}
            years={years}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-lg p-6 col-span-1">
            <h3 className="text-xl font-medium text-gray-800 mb-4">
              Total Budget
            </h3>
            {dashboardLoading ? (
              <LoadingSpinner />
            ) : analysisData && analysisData.length > 0 ? (
              <>
                <div className="text-3xl font-semibold text-gray-900 mb-4">
                  ₹
                  {analysisData
                    .reduce((acc, data) => acc + Number(data.totalBudget), 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <Pie data={pieChartData1} />
              </>
            ) : (
              <p className="text-gray-500 text-sm">
                No budget data available for the selected year.
              </p>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-1 lg:col-span-3 hidden md:block">
            <h3 className="text-xl font-medium text-gray-800 text-center mb-4">
              Monthly Spendings
            </h3>
            {dashboardLoading ? (
              <LoadingSpinner />
            ) : analysisData && analysisData.length > 0 ? (
              <div className="h-64">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm">
                No monthly spending data to display.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            Recent Logs
          </h3>
          {dashboardLoading ? (
            <LoadingSpinner />
          ) : logs && logs.length > 0 ? (
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
          ) : (
            <p className="text-gray-500 text-sm">
              No logs available for the selected year.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
