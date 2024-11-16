import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

interface LoginSignupPageProps {
	onAuthenticate: () => void;
}

const LoginSignupPage: React.FC<LoginSignupPageProps> = ({
	onAuthenticate,
}) => {
	const [isLogin, setIsLogin] = useState<boolean>(true);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});

	const navigate = useNavigate();

	const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();

		// Simulate successful login/signup (replace with API call)
		if (formData.email && formData.password) {
			console.log(`${isLogin ? "Login" : "Signup"} successful:`, formData);
			onAuthenticate(); // Notify App about authentication
			navigate("/dashboard"); // Redirect to Dashboard
		} else {
			alert("Please fill out all fields!");
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.formContainer}>
				<h2>{isLogin ? "Login" : "Sign Up"}</h2>
				<form onSubmit={handleSubmit}>
					{!isLogin && (
						<div style={styles.inputGroup}>
							<label htmlFor="username">Username</label>
							<input
								type="text"
								id="username"
								name="username"
								value={formData.username}
								onChange={handleChange}
								required={!isLogin}
							/>
						</div>
					)}
					<div style={styles.inputGroup}>
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</div>
					<div style={styles.inputGroup}>
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</div>
					<button type="submit" style={styles.button}>
						{isLogin ? "Login" : "Sign Up"}
					</button>
				</form>
				<p style={styles.toggleText}>
					{isLogin ? "Don't have an account?" : "Already have an account?"}
					<span style={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
						{isLogin ? " Sign Up" : " Login"}
					</span>
				</p>
			</div>
		</div>
	);
};

const styles = {
	container: {
		/* Same as before */
	},
	formContainer: {
		/* Same as before */
	},
	inputGroup: {
		/* Same as before */
	},
	button: {
		/* Same as before */
	},
	toggleText: {
		/* Same as before */
	},
	toggleLink: {
		/* Same as before */
	},
};

export default LoginSignupPage;
