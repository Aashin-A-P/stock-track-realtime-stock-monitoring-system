import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const goBack = () => navigate(-1);

  return (
    <>
      {token && <Navbar />}
      <div
        className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 text-gray-800 px-4 ${
          !token ? "pt-0" : ""
        }`}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-48 w-48 text-blue-500 animate-bounce"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14H14"
              strokeWidth="1.5"
              className="animate-ping opacity-50"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />{" "}
          </svg>

          <h1 className="mt-8 text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-2">
            404
          </h1>
          <p className="mt-4 text-2xl md:text-3xl font-semibold text-gray-700">
            Oops! Page Not Found.
          </p>
          <p className="mt-3 text-md text-gray-500 max-w-md mx-auto">
            It seems the page you were looking for doesn't exist or has been
            moved. Don't worry, let's get you back on track!
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
            <Link
              to={token ? "/" : "/login"}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {token ? "Go to Dashboard" : "Go to Login"}
            </Link>
          </div>

          <p className="mt-12 text-sm text-gray-400">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
