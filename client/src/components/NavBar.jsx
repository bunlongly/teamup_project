import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faGlobe, faCalendar, faFile, faBell, faRepeat, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import Khteamup from './Khteamup';
import Slogan from './Slogan';

function NavBar() {
  return (
    <nav className="navBar" style={{ backgroundColor: '#0046b0', fontFamily: 'Poppins', fontWeight: 100, fontSize: 14}}>
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-start">
            <Khteamup khColor='#21ADEA' khFont={20} />
            <Slogan />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="bg-white rounded-md px-3 py-1.5 text-base text-gray-900 outline-none focus:outline-none w-100"
          />
        </div>
        <div className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/network"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faGlobe} />
            <span>Network</span>
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faCalendar} />
            <span>Projects</span>
          </NavLink>
          <NavLink
            to="/my-projects"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faFile} />
            <span>My Projects</span>
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faBell} />
            <span>Notifications</span>
          </NavLink>
          <NavLink
            to="/candidates"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faRepeat} />
            <span>Candidates</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </NavLink>
          <NavLink
            to="/logout"
            className={({ isActive }) =>
              isActive ? 'text-[#21ADEA] flex flex-col items-center' : 'text-white flex flex-col items-center'
            }
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Log out</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;