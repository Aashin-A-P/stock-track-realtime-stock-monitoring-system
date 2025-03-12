import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";

type BudgetData = {
  budgetName: string;
  totalBudget: number;
  totalSpent: number;
  categorySpent: { category: string; spent: number }[];
  monthlySpent: number[];
};

type AnalysisData = BudgetData[];

type LogData = {
  logId: number;
  description: string;
  createdAt: Date;
};

type DashboardContextType = {
  analysisData: AnalysisData | null;
  logs: LogData[];
  years: number[];
  loading: boolean;
  error: string | null;
  fetchData: (year?: number) => void;
  setYear: React.Dispatch<React.SetStateAction<number>>;
  year: number;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface DashboardProviderProps {
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(0);
  const token = useAuth().token || "";

  const fetchData = async (selectedYear?: number) => {
    setLoading(true);
    console.log("dashboard loading started...");

    setError(null);

    // Create an AbortController to cancel fetches if needed
    const controller = new AbortController();
    const { signal } = controller;

    // Prepare headers once for all calls
    const authToken = token;
    const headers = {
      "Content-Type": "application/json",
      Authorization: authToken,
    };

    try {
      // Fetch available budget years
      const yearsResponse = await fetch(
        `${API_URL}/dashboard/budget-years`,
        { headers, signal }
      );
      if (!yearsResponse.ok) throw new Error("Failed to fetch years");
      const yearsData = await yearsResponse.json();
      setYears(yearsData.years);

      // Fetch recent logs
      const logsResponse = await fetch(
        `${API_URL}/logs/recent-logs?numberOfLogs=5`,
        { headers, signal }
      );
      if (!logsResponse.ok) throw new Error("Failed to fetch logs");
      const logsData = await logsResponse.json();
      setLogs(logsData);

      // Fetch analysis data using the selected year if it’s a valid year (> 0)
      const analysisEndpoint =
        selectedYear && selectedYear > 0
          ? `${API_URL}/dashboard/analysis?year=${selectedYear}`
          : `${API_URL}/dashboard/all-years-analysis`;
      const analysisResponse = await fetch(analysisEndpoint, {
        headers,
        signal,
      });
      if (!analysisResponse.ok)
        throw new Error("Failed to fetch analysis data");
      const analysisResult = await analysisResponse.json();

      setAnalysisData(analysisResult);
    } catch (err) {
      // Ignore abort errors, otherwise set error state
      if (err instanceof DOMException && err.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    } finally {
      setLoading(false);
      console.log("dashboard loading ended...");
    }
  }

  // On mount (or when token changes), fetch all-years analysis if token is present.
  useEffect(() => {
    if (token) {
      fetchData(0);
    }
    // No need to include setYear in dependencies as it is stable.
  }, [token]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      analysisData,
      logs,
      years,
      loading,
      error,
      fetchData,
      setYear,
      year,
    }),
    [analysisData, logs, years, loading, error, year]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
