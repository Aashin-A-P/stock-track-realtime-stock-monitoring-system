import React, { useState, useEffect } from "react";
import './logsTable.css';

interface Log {
  logId: number;
  description: string;
  createdAt: string;
}



const LogsTable: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
            `http://localhost:3000/logs/recent-logs`,
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="logs-table-container">
      <h2>Logs Table</h2>
      <div className="search-box">
        <label htmlFor="search">Search by Description:</label>
        <input
          type="text"
          id="search"
          placeholder="Enter description..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      {filteredLogs.length > 0 ? (
        <table className="logs-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Description</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.logId}>
                <td>{log.logId}</td>
                <td>{log.description}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No logs found.</div>
      )}
    </div>
  );
};

export default LogsTable;
