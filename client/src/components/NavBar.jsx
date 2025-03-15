import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faGlobe,
  faCalendar,
  faFile,
  faBell,
  faRepeat,
  faUser,
  faRightFromBracket,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Khteamup from "./Khteamup";
import Slogan from "./Slogan";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#0046b0] text-white font-poppins shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo & Search */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-start">
            <Khteamup khColor="#21ADEA" khFont={20} />
            <Slogan />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="hidden md:block bg-white rounded-md px-3 py-1.5 text-gray-900 outline-none w-56 md:w-72 lg:w-96"
          />
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6">
          {navLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? "text-[#21ADEA] flex flex-col items-center"
                  : "text-white flex flex-col items-center hover:text-gray-300 transition"
              }
            >
              <FontAwesomeIcon icon={icon} className="text-lg" />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="lg:hidden text-white text-2xl">
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`lg:hidden flex flex-col bg-[#003580] space-y-4 p-4 ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setIsMenuOpen(false)}
            className="text-white flex items-center space-x-2 hover:text-gray-300 transition"
          >
            <FontAwesomeIcon icon={icon} className="text-lg" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const navLinks = [
  { to: "/", icon: faHome, label: "Home" },
  { to: "/network", icon: faGlobe, label: "Network" },
  { to: "/projects", icon: faCalendar, label: "Projects" },
  { to: "/my-projects", icon: faFile, label: "My Projects" },
  { to: "/notifications", icon: faBell, label: "Notifications" },
  { to: "/candidates", icon: faRepeat, label: "Candidates" },
  { to: "/profile", icon: faUser, label: "Profile" },
  { to: "/logout", icon: faRightFromBracket, label: "Log Out" },
];

export default NavBar;
