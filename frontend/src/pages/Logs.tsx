import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

interface Log {
  logId: number;
  description: string;
  createdAt: string;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/logs/recent-logs`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") || "",
          },
          mode: "cors",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    const filtered = logs.filter((log) =>
      log.description.toLowerCase().includes(searchValue)
    );
    setFilteredLogs(filtered);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-600">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Logs Table</h2>
        <div className="mb-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Search by Description:
          </label>
          <input
            type="text"
            id="search"
            placeholder="Enter description..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-blue-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left bg-white shadow-lg border rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4">Log ID</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.logId}
                    className="border-b last:border-none hover:bg-blue-50"
                  >
                    <td className="p-4">{log.logId}</td>
                    <td className="p-4">{log.description}</td>
                    <td className="p-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 mt-4">No logs found.</div>
        )}
      </div>
    </>
  );
};

export default Logs;
