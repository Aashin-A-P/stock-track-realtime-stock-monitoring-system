import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const privilegesList = [
	{ privilegeId: 1, privilege: "create_user" },
	{ privilegeId: 2, privilege: "read_user" },
	{ privilegeId: 3, privilege: "update_user" },
	{ privilegeId: 4, privilege: "delete_user" },
	{ privilegeId: 5, privilege: "create_stock" },
	{ privilegeId: 6, privilege: "read_stock" },
	{ privilegeId: 7, privilege: "update_stock" },
	{ privilegeId: 8, privilege: "delete_stock" },
	{ privilegeId: 9, privilege: "create_budgets" },
	{ privilegeId: 10, privilege: "read_budgets" },
	{ privilegeId: 11, privilege: "update_budgets" },
	{ privilegeId: 12, privilege: "delete_budgets" },
	{ privilegeId: 13, privilege: "read_log" },
];

const UserManagement: React.FC = () => {
	const navigate = useNavigate();
	const { token } = useAuth();

	useEffect(() => {
		if (!token) {
			navigate("/login");
		}
	}, [token, navigate]);

	const [users, setUsers] = useState<any[]>([]);
	const [newUser, setNewUser] = useState({
		userName: "",
		password: "",
		privileges: [] as string[],
	});
	const [isUpdating, setIsUpdating] = useState(false);
	const [userToUpdate, setUserToUpdate] = useState<any>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch users from the API
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await fetch(baseUrl + "/usermanagement/", {
					method: "GET",
					headers: {
						Authorization: token || "",
					},
				});

				if (!response.ok) {
					const text = await response.text();
					console.error("Error response text:", text);
					throw new Error(`Failed to fetch users: ${response.statusText}`);
				}

				const data = await response.json();
				setUsers(
					data.map((user: any) => ({
						id: user.userId,
						name: user.userName,
						role: user.role,
					}))
				);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		if (token) {
			fetchUsers();
		}
	}, [token]);

	// Handle user creation using API
	const createUser = async () => {
		if (newUser.userName && newUser.password && newUser.privileges.length > 0) {
			try {
				const response = await fetch(baseUrl + "/usermanagement/register", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: token || "",
					},
					body: JSON.stringify({
						userName: newUser.userName,
						password: newUser.password,
						privileges: newUser.privileges,
						role: "User",
					}),
				});

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error response text:", errorText);
					throw new Error("Failed to create user");
				}

				const data = await response.json();
				setUsers([
					...users,
					{
						id: data.user.userId,
						name: data.user.userName,
						role: data.user.role,
					},
				]);
				setNewUser({
					userName: "",
					password: "",
					privileges: [],
				});
				setIsCreating(false);
			} catch (error) {
				console.error("Error creating user:", error);
				alert("Failed to create user. Please try again.");
			}
		} else {
			alert("Please provide username, password, and privileges.");
		}
	};

	// Handle user deletion using the API
	const deleteUser = async (userId: number) => {
		try {
			const response = await fetch(baseUrl + "/usermanagement/" + userId, {
				method: "DELETE",
				headers: {
					Authorization: token || "",
				},
			});

			if (response.status === 204) {
				setUsers(users.filter((user) => user.id !== userId));
				alert("User deleted successfully.");
			} else {
				const errorText = await response.text();
				console.error("Error response text:", errorText);
				throw new Error(`Failed to delete user: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			alert("Failed to delete user. Please try again.");
		}
	};

	// Handle updating user details using the API
	const updateUserPrivileges = async () => {
		if (userToUpdate) {
			try {
				const response = await fetch(
					baseUrl + "/usermanagement/" + userToUpdate.id,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: token || "",
						},
						body: JSON.stringify({
							userName: userToUpdate.name,
							privileges: userToUpdate.privileges,
						}),
					}
				);

				if (response.status === 204) {
					setUsers(
						users.map((user) =>
							user.id === userToUpdate.id
								? { ...user, role: userToUpdate.role }
								: user
						)
					);
					alert("User updated successfully.");
					setIsUpdating(false);
				} else {
					throw new Error("Failed to update user.");
				}
			} catch (error) {
				console.error("Error updating user:", error);
				alert("Failed to update user. Please try again.");
			}
		}
	};

	// Handle form input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewUser({ ...newUser, [name]: value });
	};

	const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUserToUpdate({ ...userToUpdate, [name]: value });
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value.toLowerCase());
	};

	const handlePrivilegeChange = (privilege: string) => {
		if (newUser.privileges.includes(privilege)) {
			setNewUser({
				...newUser,
				privileges: newUser.privileges.filter((p) => p !== privilege),
			});
		} else {
			setNewUser({
				...newUser,
				privileges: [...newUser.privileges, privilege],
			});
		}
	};

	const handleUpdatePrivilegeChange = (privilege: string) => {
		if (userToUpdate.privileges.includes(privilege)) {
			setUserToUpdate({
				...userToUpdate,
				privileges: userToUpdate.privileges.filter((p) => p !== privilege),
			});
		} else {
			setUserToUpdate({
				...userToUpdate,
				privileges: [...userToUpdate.privileges, privilege],
			});
		}
	};

	const filteredUsers = users.filter((user) =>
		user.name.toLowerCase().includes(searchQuery)
	);

	return (
		<>
			<Navbar />
			<div className="p-6 max-w-5xl mx-auto">
				<h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
					User Management
				</h1>

				{/* Search Bar */}
				<div className="mb-4">
					<input
						type="text"
						placeholder="Search by username"
						value={searchQuery}
						onChange={handleSearchChange}
						className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* User Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left bg-white shadow border rounded-lg">
						<thead className="bg-blue-600 text-white">
							<tr>
								<th className="p-4">Name</th>
								<th className="p-4">Role</th>
								<th className="p-4">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.map((user) => (
								<tr
									key={user.id}
									className="border-b last:border-none hover:bg-blue-50"
								>
									<td className="p-4">{user.name}</td>
									<td className="p-4">{user.role}</td>
									<td className="p-4 space-x-2">
										<button
											className="text-white bg-blue-600 px-2 py-1 rounded shadow hover:bg-blue-700"
											onClick={() => {
												setIsUpdating(true);
												setUserToUpdate({
													id: user.id,
													name: user.name,
													role: user.role,
													privileges: user.privileges || [],
												});
											}}
										>
											Edit
										</button>
										<button
											className="text-white bg-red-600 px-2 py-1 rounded shadow hover:bg-red-700"
											onClick={() => deleteUser(user.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Add New User Button */}
				<div className="mt-4 text-center">
					<button
						className="text-white bg-green-600 px-4 py-2 rounded shadow hover:bg-green-700"
						onClick={() => setIsCreating(!isCreating)}
					>
						{isCreating ? "Cancel" : "Add New User"}
					</button>
				</div>

				{/* Create User Form */}
				{isCreating && (
					<div className="mt-6 p-6 border border-gray-300 rounded bg-gray-50">
						<h2 className="text-lg font-semibold text-gray-700 mb-4">
							Create New User
						</h2>
						<div className="mb-4">
							<label className="block font-medium text-gray-700">
								Username
							</label>
							<input
								type="text"
								name="userName"
								value={newUser.userName}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter username"
							/>
						</div>
						<div className="mb-4">
							<label className="block font-medium text-gray-700">
								Password
							</label>
							<input
								type="password"
								name="password"
								value={newUser.password}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter password"
							/>
						</div>
						<div className="mb-4">
							<label className="block font-medium text-gray-700">
								Privileges
							</label>
							<div className="grid grid-cols-2 gap-2 mt-2">
								{privilegesList.map((priv) => (
									<label key={priv.privilegeId} className="flex items-center">
										<input
											type="checkbox"
											checked={newUser.privileges.includes(priv.privilege)}
											onChange={() => handlePrivilegeChange(priv.privilege)}
											className="mr-2"
										/>
										{priv.privilege}
									</label>
								))}
							</div>
						</div>
						<div className="text-right">
							<button
								className="text-white bg-green-600 px-4 py-2 rounded shadow hover:bg-green-700"
								onClick={createUser}
							>
								Create User
							</button>
						</div>
					</div>
				)}

				{/* Update User Form */}
				{isUpdating && (
					<div className="mt-6 p-6 border border-gray-300 rounded bg-gray-50">
						<h2 className="text-lg font-semibold text-gray-700 mb-4">
							Update User
						</h2>
						<div className="mb-4">
							<label className="block font-medium text-gray-700">
								Username
							</label>
							<input
								type="text"
								name="name"
								value={userToUpdate.name}
								onChange={handleUpdateChange}
								className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter username"
							/>
						</div>
						<div className="mb-4">
							<label className="block font-medium text-gray-700">
								Privileges
							</label>
							<div className="grid grid-cols-2 gap-2 mt-2">
								{privilegesList.map((priv) => (
									<label key={priv.privilegeId} className="flex items-center">
										<input
											type="checkbox"
											checked={userToUpdate.privileges.includes(priv.privilege)}
											onChange={() =>
												handleUpdatePrivilegeChange(priv.privilege)
											}
											className="mr-2"
										/>
										{priv.privilege}
									</label>
								))}
							</div>
						</div>
						<div className="text-right">
							<button
								className="text-white bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700"
								onClick={updateUserPrivileges}
							>
								Update User
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default UserManagement;
