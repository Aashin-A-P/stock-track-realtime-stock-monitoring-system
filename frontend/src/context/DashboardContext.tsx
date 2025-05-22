import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback, // Import useCallback
} from "react";
import { useAuth } from "./AuthContext";

type BudgetData = {
  budgetName: string;
  totalBudget: number;
  totalSpent: number;
  categorySpent: { category: string; spent: number }[];
  monthlySpent: number[]; // Expected to be an array of 12 numbers
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
  fetchData: (year: number) => Promise<void>; // Explicitly take number, return Promise
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
  const [year, setYear] = useState<number>(0); // 0 for "all years" view initially
  const { token: authTokenFromAuth } = useAuth(); // Renamed to avoid confusion

  const fetchData = useCallback(
    async (yearToFetch: number) => {
      // yearToFetch: 0 for all-years, >0 for specific year
      if (!authTokenFromAuth) {
        console.warn("fetchData called without a token. Aborting.");
        setAnalysisData(null);
        setLogs([]);
        setYears([]);
        setError("Not authenticated.");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(
        `Dashboard loading started for year: ${
          yearToFetch === 0 ? "All Years" : yearToFetch
        }...`
      );
      setError(null);

      const controller = new AbortController();
      const { signal } = controller;

      const headers = {
        "Content-Type": "application/json",
        Authorization: authTokenFromAuth,
      };

      try {
        // Fetch available budget years
        // This might be fetched less frequently or independently if it rarely changes
        const yearsResponse = await fetch(`${API_URL}/dashboard/budget-years`, {
          headers,
          signal,
        });
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

        // Fetch analysis data
        const analysisEndpoint =
          yearToFetch > 0
            ? `${API_URL}/dashboard/analysis?year=${yearToFetch}`
            : `${API_URL}/dashboard/all-years-analysis`;

        console.log("Fetching analysis data from:", analysisEndpoint);
        const analysisResponse = await fetch(analysisEndpoint, {
          headers,
          signal,
        });

        if (!analysisResponse.ok) {
          const errorText = await analysisResponse.text();
          console.error(
            "Failed to fetch analysis data:",
            analysisResponse.status,
            errorText
          );
          throw new Error(
            `Failed to fetch analysis data (status ${analysisResponse.status})`
          );
        }
        const analysisResult = await analysisResponse.json();
        console.log("Raw analysis data received:", analysisResult);

        // Normalize analysisResult to ensure monthlySpent is always an array of 12 numbers
        const processedAnalysisData: AnalysisData = (analysisResult || []).map(
          (item: any) => ({
            budgetName: item.budgetName || "Unknown Budget",
            totalBudget: Number(item.totalBudget) || 0,
            totalSpent: Number(item.totalSpent) || 0,
            categorySpent: Array.isArray(item.categorySpent)
              ? item.categorySpent.map((cs: any) => ({
                  category: cs.category || "Unknown Category",
                  spent: Number(cs.spent) || 0,
                }))
              : [],
            monthlySpent:
              Array.isArray(item.monthlySpent) &&
              item.monthlySpent.length === 12
                ? item.monthlySpent.map(Number) // Ensure numbers
                : Array(12).fill(0), // Default to array of 12 zeros if missing/malformed
          })
        );
        console.log("Processed analysis data:", processedAnalysisData);
        setAnalysisData(processedAnalysisData);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          const message =
            err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Error in fetchData:", message, err);
          setError(message);
          // Optionally clear data on error
          // setAnalysisData(null);
        }
      } finally {
        setLoading(false);
        console.log("Dashboard loading ended.");
      }
    },
    [authTokenFromAuth]
  ); // Dependency: only authTokenFromAuth. API_URL if it could change at runtime.

  // Initial data fetch on mount or when token changes
  useEffect(() => {
    if (authTokenFromAuth) {
      console.log(
        "Token available. Setting year to 0 and fetching initial data."
      );
      setYear(0); // Ensure year state is '0' for "all years"
      fetchData(0); // Fetch data for "all years"
    } else {
      // Clear data if token becomes unavailable (e.g., logout)
      console.log("Token unavailable. Clearing dashboard data.");
      setAnalysisData(null);
      setLogs([]);
      setYears([]);
      setYear(0);
      setError(null); // Clear any previous errors
    }
  }, [authTokenFromAuth, fetchData]); // fetchData is now stable due to useCallback

  const value = useMemo(
    () => ({
      analysisData,
      logs,
      years,
      loading,
      error,
      fetchData, // Pass the memoized fetchData
      setYear, // setYear from useState is stable
      year,
    }),
    [analysisData, logs, years, loading, error, fetchData, year] // Add fetchData and year
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
