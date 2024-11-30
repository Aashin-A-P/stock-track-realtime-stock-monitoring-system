import React, { useState, useEffect } from "react";
import './logsTable.css';

interface Log {
  logId: number;
  description: string;
  createdAt: string;
}

const LogsTable: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
            `http://localhost:3000/dashboard/recent-logs`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token") || "",
              },
              mode: "cors",
            }
          );
        if (!response.ok) {
          throw new Error("Failed to fetch logs.");
        }
        const data = await response.json();
        setLogs(data);
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="logs-table-container">
      <h2>Logs Table</h2>
      {logs.length > 0 ? (
        <table className="logs-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Description</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
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
