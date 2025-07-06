import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, LinkProps } from "react-router-dom";

// A small helper component to reduce repetition for navigation links
const NavLink: React.FC<LinkProps & { onClick: () => void; className?: string }> = ({ to, onClick, className, children }) => (
  <Link to={to} onClick={onClick} className={`transition duration-300 ${className}`}>
    {children}
  </Link>
);


const Navbar: React.FC = () => {
  const { username, role, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownVisible(p => !p);
  const toggleMobileMenu = () => setIsMobileMenuOpen(p => !p);

  const handleLogout = () => {
    logout();
    setDropdownVisible(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const usernameButton = document.getElementById("username-button");
      const dropdownContainer = document.getElementById("dropdown-container");

      if (dropdownVisible && usernameButton && !usernameButton.contains(target) && dropdownContainer && !dropdownContainer.contains(target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownVisible]);

  // Close mobile menu on resize to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setDropdownVisible(false);
  };

  // Common class names for desktop and mobile links
  const desktopLinkClass = "text-white hover:text-blue-300 transform hover:scale-105 ml-2";
  const mobileLinkClass = "block text-left text-white text-lg rounded-md py-3 px-3 hover:bg-blue-600";

  return (
    <nav className="relative bg-blue-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Left Side: Logo and Title */}
          <div className="flex-shrink-0 flex items-center">
            <img src="/images/mit-logo.png" alt="MIT Logo" className="h-12 w-12 sm:h-14 sm:w-14" />
            <h1 className="ml-3 sm:ml-4 text-white text-lg sm:text-2xl font-bold">MIT IT Stocks Manager</h1>
          </div>

          {/* Middle: Desktop Navigation Links (will be hidden on mobile) */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {username && (
              <>
                <NavLink to="/" onClick={handleLinkClick} className={desktopLinkClass}>Home</NavLink>
                <NavLink to="/addstock" onClick={handleLinkClick} className={desktopLinkClass}>Add Stock</NavLink>
                <NavLink to="/stocks" onClick={handleLinkClick} className={desktopLinkClass}>Search Stock</NavLink>
                <NavLink to="/logs" onClick={handleLinkClick} className={desktopLinkClass}>Logs</NavLink>
                {role === "admin" && (
                  <NavLink to="/users" onClick={handleLinkClick} className={desktopLinkClass}>User Management</NavLink>
                )}
                <NavLink to="/reportgeneration" onClick={handleLinkClick} className={desktopLinkClass}>Report Generation</NavLink>
                <NavLink to="/budgetform" onClick={handleLinkClick} className={desktopLinkClass}>Budgets</NavLink>
              </>
            )}
          </div>

          {/* Right Side: Dev Team, User Profile, and Hamburger Menu */}
          <div className="flex items-center space-x-4">
            {/* Dev Team link is part of the right-side group but hidden on mobile */}
            <div className="hidden lg:block ml-4">
              <NavLink to="/credits" onClick={handleLinkClick} className={desktopLinkClass}>Dev Team</NavLink>
            </div>

            {/* User Profile Dropdown (visible on all screen sizes if logged in) */}
            {username && (
              <div className="relative">
                <button id="username-button" onClick={toggleDropdown} className="flex items-center focus:outline-none p-1 rounded-full bg-blue-600 hover:bg-blue-500 transition-all">
                  <img src={"/images/user_logo.jpg"} alt="User Avatar" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover" />
                </button>
                {dropdownVisible && (
                  <div id="dropdown-container" className="absolute right-0 mt-3 w-56 bg-white bg-opacity-90 backdrop-blur-lg border border-gray-300 shadow-2xl rounded-2xl rounded-tr-none z-40">
                    {/* Dropdown content remains the same */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{username}</h3>
                      <hr className="my-2 border-gray-300" />
                      <h4 className="text-sm text-gray-700 mb-3 text-center">Are you sure you want to logout?</h4>
                      <div className="flex space-x-4">
                        <button onClick={handleLogout} title="Logout" className="flex-1 flex justify-center p-2.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>
                        </button>
                        <button onClick={() => setDropdownVisible(false)} title="Cancel" className="flex-1 flex justify-center p-2.5 bg-gray-300 text-black rounded-full shadow-md hover:bg-gray-400 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M15 9l-6 6" /><path d="M9 9l6 6" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger Menu Button (visible only on mobile) */}
            <div className="flex items-center lg:hidden">
              <button onClick={toggleMobileMenu} className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                <span className="sr-only">Open main menu</span>
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ?
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> :
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`absolute top-full left-0 right-0 bg-blue-700 shadow-lg transform transition-all duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {username && (
            <>
              <NavLink to="/" onClick={handleLinkClick} className={mobileLinkClass}>Home</NavLink>
              <NavLink to="/addstock" onClick={handleLinkClick} className={mobileLinkClass}>Add Stock</NavLink>
              <NavLink to="/stocks" onClick={handleLinkClick} className={mobileLinkClass}>Search Stock</NavLink>
              <NavLink to="/logs" onClick={handleLinkClick} className={mobileLinkClass}>Logs</NavLink>
              {role === "admin" && (
                <NavLink to="/users" onClick={handleLinkClick} className={mobileLinkClass}>User Management</NavLink>
              )}
              <NavLink to="/reportgeneration" onClick={handleLinkClick} className={mobileLinkClass}>Report Generation</NavLink>
              <NavLink to="/budgetform" onClick={handleLinkClick} className={mobileLinkClass}>Budgets</NavLink>
            </>
          )}
          <hr className="border-blue-500 my-2" />
          <NavLink to="/credits" onClick={handleLinkClick} className={mobileLinkClass}>Dev Team</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;