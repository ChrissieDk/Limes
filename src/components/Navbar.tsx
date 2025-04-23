// NavBar.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import LimesGreen from "../assets/Limes Green Logo.png";

interface NavItem {
  text: string;
  path: string;
  dotColor: string;
}

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { text: "Home", path: "/", dotColor: "lime-500" },
    {
      text: "Why Choose Limes",
      path: "/",
      dotColor: "blue-500",
    },
    { text: "Packages", path: "/p", dotColor: "purple-500" },
    {
      text: "Why Partner With Us",
      path: "/",
      dotColor: "yellow-500",
    },
    { text: "Who We Partner With", path: "/", dotColor: "red-500" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getDotColor = (color: string) => {
    switch (color) {
      case "lime-500":
        return "#abff63";
      case "blue-500":
        return "#3b82f6";
      case "purple-500":
        return "#a855f7";
      case "yellow-500":
        return "#eab308";
      case "red-500":
        return "#ef4444";
      default:
        return "#84cc16";
    }
  };

  return (
    <header className="bg-[#1a191f] w-full py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between bg-white rounded-xl px-6 py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img src={LimesGreen} alt="Limes Logo" className="h-6" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="text-gray-800 transition duration-300 relative group pb-2 font-semibold"
              >
                {item.text}
                <span
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200 border border-black"
                  style={{ backgroundColor: getDotColor(item.dotColor) }}
                ></span>
              </Link>
            ))}
          </div>

          {/* Contact Us Button */}
          <div className="hidden md:block">
            <Link
              to="/contact"
              className="bg-lime-400 text-black font-medium py-2 px-3 rounded-lg border-2 border-black transition duration-200 hover:scale-105 active:scale-100 relative text-center text-sm"
              style={{
                boxShadow: "3px 3px 0 0 rgba(0,0,0,1)",
              }}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-800 hover:text-lime-500 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white mt-2 rounded-lg p-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="text-gray-800 hover:text-lime-500 transition duration-300 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.text}
                </Link>
              ))}
              <Link
                to="/contact"
                className="bg-lime-400 hover:bg-lime-500 text-black font-medium py-2 px-6 rounded-xl transition duration-300 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
