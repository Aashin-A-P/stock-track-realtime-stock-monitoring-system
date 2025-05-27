import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const PortfolioIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11.143 3.003c.11-.001.21-.002.303-.002a3.36 3.36 0 0 1 3.358 3.358c0 .093-.001.194-.002.303m-3.659 9.339c-.11.001-.21.002-.303.002a3.36 3.36 0 0 1-3.358-3.358c0-.093.001-.194.002-.303m7.318-5.68A3.36 3.36 0 0 0 12 6.642a3.36 3.36 0 0 0-3.358 3.358c0 .093.001.194.002.303M6.642 12a3.36 3.36 0 0 0 3.358 3.358c.093 0 .194-.001.303-.002m9.339-3.659a3.36 3.36 0 0 0-3.358-3.358c-.093 0-.194.001-.303.002M3.003 11.143a3.36 3.36 0 0 0 .002.303A3.36 3.36 0 0 0 6.642 12a3.36 3.36 0 0 0 3.358-3.358c0-.093-.001-.194-.002-.303m3.659-9.339a3.36 3.36 0 0 0-.303-.002A3.36 3.36 0 0 0 12 6.642a3.36 3.36 0 0 0-3.358-3.358c0-.093.001-.194.002-.303M12 17.358a3.36 3.36 0 0 0-3.358-3.358c-.093 0-.194.001-.303.002m-9.339 3.659c.11.001.21.002.303.002A3.36 3.36 0 0 1 12 17.358a3.36 3.36 0 0 1 3.358 3.358c0 .093-.001.194-.002.303"></path>
    <circle cx="12" cy="12" r="3.34"></circle>
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

interface Contributor {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  contributions: string[];
  isLead?: boolean;
}

const contributorsData: Contributor[] = [
  {
    id: 1,
    name: "John Prabu A",
    role: "Team Lead & Full Stack Developer",
    isLead: true,
    imageUrl: "/images/profile_pic_me.png",
    bio: "Overseeing the project's development lifecycle, from conceptualization to deployment. Focused on core architecture, key feature implementation, and team coordination.",
    portfolioUrl: "https://www.jpdevland.com",
    linkedinUrl: "https://www.linkedin.com/in/johnprabu",
    githubUrl: "https://github.com/John-Prabu-A/",
    contributions: [
      "Project Management & Lead",
      "System Architecture",
      "Core UI/UX (React)",
      "Backend API Development & Integration",
      "Authentication & Authorization",
      "Database Design (PostgreSQL)",
      "Deployment & DevOps",
    ],
  },
  {
    id: 2,
    name: "Sandhip Suriya K.S",
    role: "Backend Lead & Developer",
    imageUrl: "/images/profile_pic_sandhip.jpg",
    bio: "Led the backend development, ensuring robust and scalable server-side logic, API development, and database management.",
    linkedinUrl:
      "https://www.linkedin.com/in/sandhip-suriya-k-s-5aa011264?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    githubUrl: "https://github.com/sandhipsuriya",
    contributions: [
      "Backend API Development (Node.js/Express)",
      "Database Management (PostgreSQL)",
      "Server-side Logic Implementation",
      "API Security & Performance",
      "Data Modeling",
    ],
  },
  {
    id: 3,
    name: "Aashin A.P",
    role: "Frontend Developer",
    imageUrl: "/images/profile_pic_aashin.jpeg",
    bio: "Contributed to building responsive and interactive user interfaces, focusing on component development and user experience.",
    linkedinUrl:
      "https://www.linkedin.com/in/aashin-a-p-21jan2005?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    githubUrl: "https://github.com/Aashin-A-P",
    contributions: [
      "User Interface Development (React/Tailwind CSS)",
      "Component Design",
      "State Management",
      "Frontend Routing",
      "API Data Consumption",
    ],
  },
  {
    id: 4,
    name: "Aadharsh S",
    role: "Frontend Developer",
    imageUrl: "/images/profile_pic_aadharsh.jpeg",
    bio: "Worked on various frontend tasks, including UI enhancements, feature implementation, and ensuring cross-browser compatibility.",
    linkedinUrl: "https://www.linkedin.com/in/aadharsh-senthil-334084257?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    githubUrl: "https://github.com/Aadharsh12", 
    contributions: [
      "UI/UX Enhancements",
      "Feature Implementation (Frontend)",
      "Responsive Design & Testing",
      "Component Library Collaboration",
      "Bug Fixing",
    ],
  },
];

const universityInfo = {
  degree: "B.Tech Information Technology",
  year: "3rd Year",
  batch: "2022 - 2026 Batch",
  campus: "MIT Campus, Anna University",
  department: "Department of Information Technology",
};

const CreditsPage: React.FC = () => {
  const navigate = useNavigate();

  const buttonBaseStyle =
    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out shadow-md hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-50";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-10 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center gap-2 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1"
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
            Back
          </button>

          <header className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-2">
              Meet the Innovators
            </h1>
            <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
              This Inventory Management System is a product of passion,
              dedication, and teamwork from the brilliant minds at the{" "}
              <span className="font-semibold text-indigo-700">
                {universityInfo.department}
              </span>
              .
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-12">
            {contributorsData.map((contributor) => (
              <div
                key={contributor.id}
                className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group hover:shadow-blue-300/50
                  ${contributor.isLead
                    ? "lg:col-span-2 bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 p-0" // Full span for lead, adjust padding later
                    : "bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex flex-col pt-8" // Member card
                  }`}
              >
                {/* Decorative element for lead */}
                {contributor.isLead && (
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-500 rounded-full opacity-30 blur-xl animate-pulse"></div>
                )}

                <div
                  className={`flex ${contributor.isLead
                      ? "flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 p-6 md:p-10"
                      : "flex-col items-center text-center"
                    }`}
                >
                  <div
                    className={`flex-shrink-0 ${contributor.isLead
                        ? "md:w-1/3 flex justify-center md:justify-center"
                        : "mb-6"
                      }`}
                  >
                    <img
                      src={contributor.imageUrl}
                      alt={contributor.name}
                      className={`object-cover shadow-xl
                        ${contributor.isLead
                          ? "w-96 h-96 md:w-72 md:h-72 rounded-full border-4 border-indigo-300 group-hover:border-indigo-500"
                          : "w-64 h-64 rounded-full border-4 border-blue-200 group-hover:border-blue-400"
                        }`}
                    />
                  </div>

                  <div
                    className={`${contributor.isLead ? "md:w-2/3" : "w-full px-6 pb-8"
                      }`}
                  >
                    <h2 className="text-3xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                      {contributor.name}
                    </h2>
                    <p
                      className={`mt-1 text-xl font-semibold ${contributor.isLead ? "text-indigo-600" : "text-blue-600"
                        }`}
                    >
                      {contributor.role}
                    </p>
                    <p className="mt-3 text-sm text-gray-600">
                      {universityInfo.year}, {universityInfo.degree} (
                      {universityInfo.batch})
                      <br />
                      {universityInfo.campus}
                    </p>
                    <p className="mt-5 text-gray-700 text-base leading-relaxed">
                      {contributor.bio}
                    </p>

                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-800">
                        Key Contributions:
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-gray-600 text-sm">
                        {contributor.contributions.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={`mt-8 flex flex-wrap gap-3 ${contributor.isLead ? "justify-start" : "justify-center"
                        }`}
                    >
                      {contributor.portfolioUrl && (
                        <a
                          href={contributor.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${buttonBaseStyle} bg-slate-700 hover:bg-slate-800 text-white focus:ring-slate-500`}
                        >
                          <PortfolioIcon /> Portfolio
                        </a>
                      )}
                      {contributor.linkedinUrl &&
                        contributor.linkedinUrl !== "#" && (
                          <a
                            href={contributor.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${buttonBaseStyle} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400`}
                          >
                            <LinkedInIcon /> LinkedIn
                          </a>
                        )}
                      {contributor.githubUrl &&
                        contributor.githubUrl !== "#" && (
                          <a
                            href={contributor.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${buttonBaseStyle} bg-gray-800 hover:bg-black text-white focus:ring-gray-600`}
                          >
                            <GitHubIcon /> GitHub
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-20 text-center pb-10">
            <p className="text-gray-700 text-lg">
              A proud creation by the {universityInfo.batch} of Anna University,
              MIT Campus.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              © {new Date().getFullYear()} MIT IT Stocks Manager Team. All
              Rights Reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default CreditsPage;
