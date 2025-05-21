import { useState, useEffect, SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type Privilege = {
  privilegeId: number;
  privilege: string;
};

const SvgEyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5} // Common stroke width for Tailwind-like icons
    stroke="currentColor"
    // className applied here will be merged or overridden by props.className
    // Default size, can be overridden by className prop
    className={`w-5 h-5 ${props.className || ''}`}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SvgEyeSlashIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-5 h-5 ${props.className || ''}`}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
    />
  </svg>
);

const CreateUserPage = () => {
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  }

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

    if (!userName || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (selectedPrivileges.length === 0) {
      toast.error("Please select at least one privilege.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const userNameRegex = /^[a-zA-Z0-9_]+$/;
    if (!userNameRegex.test(userName)) {
      toast.error("Username can only contain letters and numbers.");
      return;
    }

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
          password: password,
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
        <div className="p-6 max-w-5xl mx-auto text-center text-blue-700">
          <LoadingSpinner />
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
          <div className="mb-4"> {/* Container for the name input */}
    <label htmlFor="userNameInput" className="block mb-2 text-sm font-medium text-gray-700">
      Name
    </label>
    <input
      id="userNameInput"
      placeholder="Enter name"
      type="text"
      value={userName} // Ensure userName and setUserName are defined in your component's state
      onChange={(e) => setUserName(e.target.value)} // Ensure setUserName is defined
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>

  {/* Password Input Field with Eye Icon START */}
  <div className="mb-4">
    <label htmlFor="passwordInput" className="block mb-2 text-sm font-medium text-gray-700">
      Password
    </label>
    <div className="relative"> {/* Parent div for positioning the icon */}
      <input
        id="passwordInput"
        placeholder="Enter password"
        type={showPassword ? 'text' : 'password'}
        value={password} // Ensure password and setPassword are defined in your component's state
        onChange={(e) => setPassword(e.target.value)} // Ensure setPassword is defined
        className="w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        // pr-10 adds padding to the right for the icon
      />
      <button
        type="button" // Important to prevent form submission
        onClick={togglePasswordVisibility} // Ensure togglePasswordVisibility is defined
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded-md"
        // Added focus:ring styles for better accessibility on the button
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
      >
        {showPassword ? (
          <SvgEyeSlashIcon className="w-5 h-5" /> // Tailwind size classes applied directly
        ) : (
          <SvgEyeIcon className="w-5 h-5" />    // Tailwind size classes applied directly
        )}
      </button>
    </div>
  </div>
         
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
