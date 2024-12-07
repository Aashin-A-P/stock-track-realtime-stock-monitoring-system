import React, { createContext, useContext, useState, useEffect } from "react";

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

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

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

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(0);
  const token = localStorage.getItem("token");

  const fetchData = async (year?: number) => {
    setLoading(true);
    setError(null);

    try {
      const yearsResponse = await fetch(`${API_URL}/dashboard/budget-years`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token || localStorage.getItem("token") || "",
        }
      });
      if (!yearsResponse.ok) throw new Error("Failed to fetch years");
      const { years } = await yearsResponse.json();
      setYears(years);

      const logsResponse = await fetch(`${API_URL}/logs/recent-logs?numberOfLogs=5`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token || localStorage.getItem("token") || "",
        },
      });
      if (!logsResponse.ok) throw new Error("Failed to fetch logs");
      const logs = await logsResponse.json();
      setLogs(logs);

      const analysisEndpoint = year
        ? `${API_URL}/dashboard/analysis?year=${year}`
        : `${API_URL}/dashboard/all-years-analysis`;
      const analysisResponse = await fetch(analysisEndpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token || localStorage.getItem("token") || "",
        },
      });
      if (!analysisResponse.ok) throw new Error("Failed to fetch analysis data");
      const result = await analysisResponse.json();

      setAnalysisData(year ? result : { ...result, monthlySpent: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(localStorage.getItem("token")) 
    fetchData(0);
  }, [setYear]);

  return (
    <DashboardContext.Provider
      value={{ analysisData, logs, years, loading, error, fetchData, setYear, year }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
