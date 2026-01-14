import { useState } from "react";
import {  NavLink } from "react-router-dom";
import logo from "/media/logo.webp";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-blue-950/90 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg">
      {/* Left Section - Logo and Title */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="h-10 w-auto" />
        <span className="hidden md:inline text-white font-bold text-lg tracking-wide">
          Smart Home
        </span>
      </div>

      {/* Right Section (Desktop) */}
      <div className="hidden md:flex items-center gap-6">

        <NavLink
          to="/register"
          className={({ isActive }) =>
            `font-medium transition duration-200 ${
              isActive ? "text-white border-b-2 border-white" : "text-gray-300 hover:text-white"
            }`
          }
        >
          Register
        </NavLink> 

        <NavLink
          to="/login"
          className={({ isActive }) =>
            `bg-white text-black px-4 py-1.5 rounded-md font-semibold hover:bg-gray-200 transition duration-200 ${
              isActive ? "border border-black" : ""
            }`
          }
        >
          Login
        </NavLink>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="md:hidden text-white"
        aria-label="Open menu"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Menu (Mobile) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-blue-950 text-white z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="flex flex-col gap-4 px-6 py-6">
          <NavLink
            to="/dashboard/safety-monitoring"
            onClick={() => setMenuOpen(false)}
            className="hover:bg-blue-900 px-4 py-2 rounded transition"
          >
            Safety
          </NavLink>

          <NavLink
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="hover:bg-blue-900 px-4 py-2 rounded transition"
          >
            Register
          </NavLink>

          <NavLink
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition"
          >
            Login
          </NavLink>
        </div>
      </div>
    </nav>
  );
}



 