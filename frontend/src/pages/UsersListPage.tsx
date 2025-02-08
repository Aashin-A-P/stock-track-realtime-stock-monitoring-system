import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Define the structure of a user
type User = {
  id: string;
  name: string;
  role: string;
};

// Define the structure of pagination state
type Pagination = {
  page: number;
  pageSize: number;
  totalRecords: number;
};

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 15,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/usermanagement?page=${pagination.page}&pageSize=${pagination.pageSize}&search=${searchQuery}`,
          { headers: { Authorization: token || "" } }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users.");
        }

        const data: { users: User[]; totalRecords: number } =
          await response.json();
        setUsers(data.users);
        setPagination((prev) => ({ ...prev, totalRecords: data.totalRecords }));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [pagination.page, pagination.pageSize, searchQuery, token]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRowClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          User Management
        </h1>

        <div className="flex items-center space-x-3 mb-3">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-grow px-4 py-2 border rounded-lg"
          />
          {/* Create User Button */}
          <button
            onClick={() => navigate("/users/create")}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            Create User
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left bg-white shadow border rounded-lg">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-none hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleRowClick(user.id)}
                  >
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-4 text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of{" "}
            {Math.ceil(pagination.totalRecords / pagination.pageSize)}
          </span>
          <button
            disabled={
              pagination.page >=
              Math.ceil(pagination.totalRecords / pagination.pageSize)
            }
            onClick={() => handlePageChange(pagination.page + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default UsersListPage;
