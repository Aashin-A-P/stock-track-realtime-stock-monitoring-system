import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type Privilege = {
  privilegeId: number;
  privilege: string;
};

type User = {
  userName: string;
  privileges: string[];
};

const UserDetailsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, privilegesResponse] = await Promise.all([
          fetch(`${baseUrl}/usermanagement/${id}`, {
            headers: { Authorization: token || "" },
          }),
          fetch(`${baseUrl}/privileges/getprivileges`, {
            headers: { Authorization: token || "" },
          }),
        ]);

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }
        if (!privilegesResponse.ok) {
          throw new Error(
            `Failed to fetch privileges data: ${privilegesResponse.status}`
          );
        }

        const userData = await userResponse.json();
        const privilegesData = await privilegesResponse.json();

        setUser(userData);
        setPrivileges(privilegesData.privileges);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate]);

  const handleDeleteUser = async () => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this User?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const response = await fetch(`${baseUrl}/usermanagement/${id}`, {
                method: "DELETE",
                headers: { Authorization: token || "" },
              });

              if (response.status === 204) {
                toast.success("User deleted successfully.");
                navigate("/users");
              } else {
                throw new Error("Failed to delete user.");
              }
            } catch (error) {
              console.error("Error deleting user:", error);
              toast.error("Failed to delete user.");
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleUpdateUser = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${baseUrl}/usermanagement/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 204) {
        toast.success("User updated successfully.");
        navigate("/users");
      } else {
        throw new Error("Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6 max-w-5xl mx-auto">
          <p>Loading user details...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        {user ? (
          <>
            <h1 className="text-2xl font-bold text-blue-700 mb-4">
              User Details
            </h1>
            <div className="mb-4">
              <label className="block mb-2">Name</label>
              <input
                placeholder="Enter name"
                type="text"
                value={user.userName}
                onChange={(e) => setUser({ ...user, userName: e.target.value })}
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
                      checked={user.privileges.includes(priv.privilege)}
                      onChange={() =>
                        setUser({
                          ...user,
                          privileges: user.privileges.includes(priv.privilege)
                            ? user.privileges.filter(
                                (p) => p !== priv.privilege
                              )
                            : [...user.privileges, priv.privilege],
                        })
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
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
              >
                Update
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <p>User not found.</p>
        )}
      </div>
    </>
  );
};

export default UserDetailsPage;
