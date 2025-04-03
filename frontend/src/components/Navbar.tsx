import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
	const { username, role, logout } = useAuth();
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const navigate = useNavigate();

	// Toggle the visibility of the dropdown
	const toggleDropdown = () => {
		setDropdownVisible((prevState) => !prevState);
	};

	// Handle user logout
	const handleLogout = () => {
		logout();
		setDropdownVisible(false);
		navigate("/login");
	};

	// Close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const usernameButton = document.getElementById("username-button");
			if (
				dropdownVisible &&
				usernameButton &&
				!usernameButton.contains(event.target as Node) &&
				!(event.target as Element)?.closest("#dropdown-container")
			) {
				setDropdownVisible(false);
			}
		};

		// Add event listener for clicks outside
		document.addEventListener("mousedown", handleClickOutside);

		// Clean up event listener on component unmount
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dropdownVisible]);

	return (
		<nav className="flex items-center justify-between px-6 py-4 bg-blue-700 shadow-lg sticky top-0 z-10">
			<div className="flex items-center space-x-4">
				<img src="/images/mit-logo.png" alt="MIT Logo" className="h-14 w-14" />
				<h1 className="text-white text-3xl font-bold">MIT IT Stocks Manager</h1>
			</div>

			{/* Navbar Links */}
			<div className="flex-grow ml-10">
				{username && (
					<ul className="flex space-x-6">
						<li>
							<Link
								to="/"
								className="text-white hover:text-blue-300 transition duration-300 transform hover:scale-105"
							>
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/addstock"
								className="text-white hover:text-blue-300 transition duration-300 transform hover:scale-105"
							>
								Add Stock
							</Link>
						</li>
						<li>
							<Link
								to="/stocks"
								className="text-white hover:text-blue-300 transition duration-300 transform hover:scale-105"
							>
								Search Stock
							</Link>
						</li>
						<li>
							<Link
								to="/logs"
								className="text-white hover:text-blue-300 transition duration-300 transform hover:scale-105"
							>
								Logs
							</Link>
						</li>
						{role === "admin" && (
							<>
								<li>
									<Link
										to="/users"
										className="text-white hover:text-blue-300 transition duration-300 transform hover:scale-105"
									>
										User Management
									</Link>
								</li>
								<li>
									<Link
										to="/reportgeneration"
										className="text-white hover:text-blue-300 transition duration-300 transform hover:scale-105"
									>
										Report Generation 
									</Link>
								</li>
								<li>
									<Link to="/budgetform" className="text-white hover:text-blue-300 transition duration-300 transform hover:scale-105"
									>
										Budgets
									</Link>
								</li>
							</>
						)}
					</ul>
				)}
			</div>

			{/* Username and Dropdown */}
			{username && (
				<div className="relative">
					{/* Username Button */}

					<div
						id="username-button"
						className="cursor-pointer text-white p-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-all duration-200"
						onClick={toggleDropdown}
					>

					{/* Profile Image */}
					<img
						src={"/images/user_logo.jpg"} // Use profileImage or fallback
						alt="User Avatar"
						className="h-8 w-8 rounded-full object-cover"
					/>
					</div>

					{/* Dropdown */}
					{dropdownVisible && (
						<div
							id="dropdown-container"
							className="absolute right-0 mt-2 w-48 bg-white bg-opacity-60 backdrop-blur-lg border border-gray-300 shadow-2xl rounded-3xl rounded-tr-none z-20"
						>
							<div className="p-4">
								{/* Username */}
								<h3 className="text-lg font-semibold text-gray-800 mb-2">{username}</h3>
								<hr className="my-2 border-gray-300"/>
								<h4 className="text-sm text-gray-700 mb-3">
									Are you sure you want to logout?
								</h4>

								{/* Icons in a single line */}
								<div className="flex space-x-4 w-full">
									{/* Logout Icon */}
									<div
										className="flex flex-1 items-center justify-center p-3 cursor-pointer bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
										onClick={handleLogout}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="icon icon-tabler icons-tabler-outline icon-tabler-logout"
										>
											<path stroke="none" d="M0 0h24v24H0z" fill="none" />
											<path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
											<path d="M9 12h12l-3 -3" />
											<path d="M18 15l3 -3" />
										</svg>
									</div>

									{/* Cancel Icon */}
									<div
										className="flex items-center justify-center p-3 cursor-pointer bg-gray-300 text-black rounded-full shadow-lg hover:bg-gray-400 transition-all duration-200"
										onClick={() => setDropdownVisible(false)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="icon icon-tabler icons-tabler-outline icon-tabler-circle-x"
										>
											<path stroke="none" d="M0 0h24v24H0z" fill="none" />
											<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
											<path d="M15 9l-6 6" />
											<path d="M9 9l6 6" />
										</svg>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
