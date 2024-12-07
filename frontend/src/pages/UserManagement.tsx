import React, { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock user data (replace with API data in real-world app)
const mockUsers = [
	{ id: 1, name: "Alice", password: "alice123", role: "Admin" },
	{ id: 2, name: "Bob", password: "bob123", role: "User" },
];

const UserManagement: React.FC = () => {
	const navigate = useNavigate();
	const { token } = useAuth();
  
	useEffect(() => {
	  if (!token) {
		navigate("/login");
	  }
	}, [token, navigate]);
	const [users, setUsers] = useState(mockUsers); // State for managing users
	const [newUser, setNewUser] = useState({ name: "", password: "" }); // Form for new user
	const [isUpdating, setIsUpdating] = useState(false); // Toggle for update
	const [userToUpdate, setUserToUpdate] = useState<any>(null); // User to update
	const [isCreating, setIsCreating] = useState(false); // Toggle for showing Create User form
	const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering users

	// Handle user creation
	const createUser = () => {
		if (newUser.name && newUser.password) {
			setUsers([...users, { ...newUser, id: users.length + 1, role: "User" }]);
			setNewUser({ name: "", password: "" }); // Reset form
			setIsCreating(false); // Close the form after creation
		} else {
			alert("Please provide both username and password.");
		}
	};

	// Handle user deletion
	const deleteUser = (userId: number) => {
		setUsers(users.filter((user) => user.id !== userId));
	};

	// Handle updating user privileges
	const updateUserPrivileges = () => {
		if (userToUpdate) {
			setUsers(
				users.map((user) =>
					user.id === userToUpdate.id
						? { ...user, role: userToUpdate.role }
						: user
				)
			);
			setIsUpdating(false); // Close update form
		}
	};

	// Handle form input changes for new user
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "name" || name === "password") {
			setNewUser({ ...newUser, [name]: value });
		}
	};

	// Handle update form input change
	const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUserToUpdate({ ...userToUpdate, [name]: value });
	};

	// Handle search input change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value.toLowerCase());
	};

	// Filter users by name based on the search query
	const filteredUsers = users.filter((user) =>
		user.name.toLowerCase().includes(searchQuery)
	);

	return (
		<div>
			<h1 style={{ textAlign: "center" }}>User Management</h1>

			{/* Search Bar - Positioned Above the Table */}
			<div className="search-container">
				<input
					type="text"
					placeholder="Search by username"
					value={searchQuery}
					onChange={handleSearchChange}
					className="search-input"
				/>
			</div>

			{/* All Users Section */}
			<div className="users-section">
				<h2>All Users</h2>
				<table className="user-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Role</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map((user) => (
							<tr key={user.id}>
								<td>{user.name}</td>
								<td>{user.role}</td>
								<td>
									<button
										className="delete-btn"
										onClick={() => deleteUser(user.id)}
									>
										Delete
									</button>
									<button
										className="update-btn"
										onClick={() => {
											setIsUpdating(true);
											setUserToUpdate(user);
										}}
									>
										Update
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* Create User Button - Positioned Below the Table */}
				<button className="create-user-btn" onClick={() => setIsCreating(true)}>
					Create User
				</button>
			</div>

			{/* Create User Form Overlay */}
			{isCreating && (
				<div className="overlay">
					<div className="form-container">
						<h2>Create User</h2>
						<form>
							<input
								type="text"
								name="name"
								value={newUser.name}
								onChange={handleInputChange}
								placeholder="Username"
							/>
							<input
								type="password"
								name="password"
								value={newUser.password}
								onChange={handleInputChange}
								placeholder="Password"
							/>
							<div className="button-container">
								<button type="button" onClick={createUser}>
									Create User
								</button>
								<button type="button" onClick={() => setIsCreating(false)}>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Update User Privileges Form */}
			{isUpdating && userToUpdate && (
				<div>
					<h2>Update Privileges for {userToUpdate.name}</h2>
					<input
						type="text"
						name="role"
						value={userToUpdate.role}
						onChange={handleUpdateChange}
						placeholder="Role (Admin/User)"
					/>
					<button onClick={updateUserPrivileges}>Update</button>
					<button onClick={() => setIsUpdating(false)}>Cancel</button>
				</div>
			)}
		</div>
	);
};

export default UserManagement;
