import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type Privilege = {
  privilegeId: number;
  privilege: string;
};

const CreateUserPage = () => {
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>("");
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPrivileges = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/privileges/getprivileges`, {
          headers: { Authorization: token || "" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch privileges: ${response.status}`);
        }

        const data = await response.json();
        setPrivileges(data.privileges);
      } catch (error) {
        console.error("Error fetching privileges:", error);
        toast.error("Failed to fetch privileges.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivileges();
  }, [token, navigate]);

  const handleCreateUser = async () => {
    try {
      const response = await fetch(`${baseUrl}/usermanagement/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({
          userName,
          privileges: selectedPrivileges,
          password: "password",
        }),
      });

      if (response.ok) {
        toast.success("User created successfully.");
        navigate("/users");
      } else {
        throw new Error(`Failed to create user: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6 max-w-5xl mx-auto">
          <p>Loading privileges...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Create User</h1>
        <div className="mb-4">
          <label className="block mb-2">Name</label>
          <input
            placeholder="Enter name"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Privileges</label>
          <div className="grid grid-cols-2 gap-2">
            {privileges.map((priv) => (
              <label key={priv.privilegeId} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPrivileges.includes(priv.privilege)}
                  onChange={() =>
                    setSelectedPrivileges((prev) =>
                      prev.includes(priv.privilege)
                        ? prev.filter((p) => p !== priv.privilege)
                        : [...prev, priv.privilege]
                    )
                  }
                  className="mr-2"
                />
                {priv.privilege}
              </label>
            ))}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Create
          </button>
          <button
            onClick={() => navigate("/users")}
            className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateUserPage;
