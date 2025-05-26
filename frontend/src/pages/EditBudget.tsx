import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import BudgetForm from "../components/BudgetForm";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EditBudget: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("token") || "";
  const [initialData, setInitialData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const response = await fetch(`${API_URL}/funds/${id}`, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch budget");
        }

        const data = await response.json();
        setInitialData(data.budget);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    fetchBudget();
  }, [id, token]);

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-6 px-8">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-8">Edit Budget</h2>
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </>
    );
  }

  if (!initialData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-6 px-8">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-8">Edit Budget</h2>
          <p className="text-center">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-8">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-8">Edit Budget</h2>
        <BudgetForm budgetId={Number(id)} initialData={initialData} />
      </div>
    </>
  );
};

export default EditBudget;