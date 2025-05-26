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
  Title, // Import Title if you plan to use it
} from "chart.js";
import { toast } from "react-toastify";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title // Register Title
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !token && !localStorage.getItem("token")) {
      // If auth loading is complete and no token, redirect to login
      toast.error("You need to log in to access the dashboard.");
      localStorage.removeItem("token");
      localStorage.removeItem("username"); 
      localStorage.removeItem("role"); 
      navigate("/login");
    }
  }, [token, authLoading, navigate]);

  const {
    analysisData,
    logs,
    years,
    loading: dashboardLoading,
    year, // current selected year from context
    fetchData,
    setYear, // function to update year in context
  } = useDashboard();

  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear); // Update year in context
    fetchData(selectedYear); // Fetch data for the newly selected year
  };

  const generateBlueShades = (count: number) =>
    Array.from(
      { length: count },
      (_, idx) => `hsl(${200 + idx * (40 / Math.max(1, count - 1))}, 70%, 60%)` // একটু ভালো শেড জেনারেট করতে
    );

  const pieChartData1 = {
    labels: analysisData?.map((data) => data.budgetName),
    datasets: [
      {
        label: "Total Budget Distribution", // Added label for clarity
        data: analysisData?.map((data) => data.totalBudget),
        backgroundColor: generateBlueShades(analysisData?.length || 0),
        borderColor: analysisData?.map(() => "rgba(255, 255, 255, 0.6)"), // Optional: border for segments
        borderWidth: 1, // Optional
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
    datasets:
      analysisData && analysisData.length > 0
        ? analysisData.map((data, i) => ({
            label: `${data.budgetName} - Monthly Spendings`,
            data: data.monthlySpent, // This should now be a safe array of 12 numbers
            borderColor: generateBlueShades(analysisData.length)[i],
            tension: 0.3, // Adjusted for potentially smoother curves
            fill: false,
            pointRadius: 3, // Optional: make points more visible
            pointHoverRadius: 5, // Optional
          }))
        : [],
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 10, // Smaller font for legend
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
  };

  if (authLoading) return <LoadingSpinner />;
  // If not authLoading and no token, useEffect above will navigate.
  // Can also add: if (!token) return <p>Redirecting to login...</p>; to prevent flicker.

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
            selectedYear={year} // Use year from context
            onSelectYear={handleYearChange}
            years={years}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-2 lg:col-span-1">
            {" "}
            {/* Adjusted md span */}
            <h3 className="text-xl font-medium text-gray-800 mb-4 text-center">
              Total Budget
            </h3>
            {dashboardLoading ? (
              <LoadingSpinner />
            ) : analysisData && analysisData.length > 0 ? (
              <>
                <div className="text-3xl font-semibold text-gray-900 mb-4 text-center">
                  ₹
                  {analysisData
                    .reduce((acc, data) => acc + Number(data.totalBudget), 0)
                    .toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </div>
                <div className="h-64 md:h-72">
                  {" "}
                  {/* Ensure height for pie chart */}
                  <Pie data={pieChartData1} options={commonChartOptions} />
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 text-sm">
                No budget data available for the selected year.
              </p>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-2 lg:col-span-3">
            {" "}
            {/* Adjusted md span */}
            <h3 className="text-xl font-medium text-gray-800 text-center mb-4">
              Monthly Spendings
            </h3>
            {dashboardLoading ? (
              <LoadingSpinner />
            ) : analysisData &&
              analysisData.length > 0 &&
              analysisData.some((d) => d.monthlySpent.some((s) => s > 0)) ? ( // Check if there's any actual spending
              <div className="h-96">
                {" "}
                {/* Increased height for line chart */}
                <Line data={lineChartData} options={commonChartOptions} />
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm">
                {dashboardLoading
                  ? "Loading data..."
                  : "No monthly spending data to display for the selected year."}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            Recent Logs
          </h3>
          {dashboardLoading ? ( // Logs also depend on dashboardLoading
            <LoadingSpinner />
          ) : logs && logs.length > 0 ? (
            <ul className="space-y-3 divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <li key={log.logId} className="text-gray-700 pt-3 first:pt-0">
                  <span className="font-medium">{log.description}</span> -{" "}
                  <span className="text-sm text-gray-500">
                    {dayjs(log.createdAt).fromNow()} (
                    {dayjs(log.createdAt).format("DD MMM YYYY, hh:mm A")})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No recent logs available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
