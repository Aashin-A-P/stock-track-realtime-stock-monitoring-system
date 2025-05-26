import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { confirmAlert } from "react-confirm-alert";
import LoadingSpinner from "../components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Budget {
  budgetId: number;
  budgetName: string;
  startDate: string;
  endDate: string;
  amount: number;
}

const BudgetList: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/funds`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch budgets");
        }

        const data = await response.json();
        setBudgets(data.budgets);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [token]);

  const handleDelete = async (budgetId: number) => {
    confirmAlert({
      message: "Are you sure you want to delete this budget?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const response = await fetch(`${API_URL}/funds/${budgetId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `${token}`,
                },
              });

              if (!response.ok) {
                throw new Error("Failed to delete budget");
              }

              setBudgets(budgets.filter((budget) => budget.budgetId !== budgetId));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unknown error occurred");
            }
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    })
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-8">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-8">Budgets</h2>
        {!loading && error && !budgets && <p className="text-red-500 mb-4">{error}</p>}
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
          <Link to="/create-budget" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-4 inline-block">
            Create New Budget
          </Link>
          {loading ? <LoadingSpinner /> :
            <table className="w-full mt-4">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Start Date</th>
                  <th className="border px-4 py-2">End Date</th>
                  <th className="border px-4 py-2">Amount</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget.budgetId}>
                    <td className="border px-4 py-2">{budget.budgetName}</td>
                    <td className="border px-4 py-2">{budget.startDate}</td>
                    <td className="border px-4 py-2">{budget.endDate}</td>
                    <td className="border px-4 py-2">{budget.amount}</td>
                    <td className="border px-4 py-2 flex gap-2 items-center justify-center">
                      <button onClick={() => navigate(`/edit-budget/${budget.budgetId}`)} className="bg-blue-600 text-white py-1 px-2 rounded-lg hover:bg-blue-700">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget.budgetId)}
                        className="bg-red-600 text-white py-1 px-2 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </div>
    </>
  );
};

export default BudgetList;