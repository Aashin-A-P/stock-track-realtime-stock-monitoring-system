import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface BudgetFormProps {
  budgetId?: number;
  initialData?: {
    budgetName: string;
    startDate: string;
    endDate: string;
    amount: number;
  };
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budgetId, initialData }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [budgetName, setBudgetName] = useState(initialData?.budgetName || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [amount, setAmount] = useState<number | "">(initialData?.amount || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/funds${budgetId ? `/${budgetId}` : ""}`, {
        method: budgetId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ budgetName, startDate, endDate, amount }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${budgetId ? "update" : "create"} budget`);
      }

      navigate("/budget-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 shadow-lg rounded-lg">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="budgetName">
          Budget Name
        </label>
        <input
          type="text"
          id="budgetName"
          value={budgetName}
          onChange={(e) => setBudgetName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="startDate">
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="endDate">
          End Date
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="amount">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : "")}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 ${loading && "opacity-50"}`}
        disabled={loading}
      >
        {loading ? (budgetId ? "Updating..." : "Creating...") : (budgetId ? "Update Budget" : "Create Budget")}
      </button>
    </form>
  );
};

export default BudgetForm;