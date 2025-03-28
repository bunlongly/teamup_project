// NavBar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faGlobe,
  faCalendar,
  faFile,
  faBell,
  faRepeat,
  faUser,
  faRightFromBracket,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Khteamup from './Khteamup';
import Slogan from './Slogan';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NavBar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState('');

  // Decode the token to get userId and store it in local state (and localStorage)
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.userId) {
          setUserId(decoded.userId);
          localStorage.setItem('userId', decoded.userId);
        }
      } catch (error) {
        console.error('Failed to decode token', error);
      }
    }
  }, [token]);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUserId(localStorage.getItem('userId'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Logout handler with toast notifications
  const handleLogout = async () => {
    try {
      const logoutToastId = toast.loading('Logging out...');
      await axios.post(
        'http://localhost:5200/api/auth/logout',
        {},
        { withCredentials: true }
      );
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      toast.update(logoutToastId, {
        render: 'Successfully logged out!',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
      setTimeout(() => navigate('/signin'), 2000);
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.', { autoClose: 3000 });
    }
  };

  const location = window.location.pathname;
  const showNavBar = token && !['/signup', '/signin'].includes(location);

  return (
    <>
      {showNavBar && (
        <nav
          className='navBar'
          style={{
            backgroundColor: '#0046b0',
            fontFamily: 'Poppins',
            fontWeight: 100,
            fontSize: 14
          }}
        >
          <div className='container mx-auto px-4 py-2 flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              <div className='flex flex-col items-start'>
                <Khteamup khColor='#21ADEA' khFont={20} />
                <Slogan />
              </div>
              <input
                type='text'
                placeholder='Search...'
                className='bg-white rounded-md px-3 py-1.5 text-base text-gray-900'
              />
            </div>
            <div className='flex items-center space-x-4'>
              <NavLink
                to='/'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </NavLink>
              <NavLink
                to='/network'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faGlobe} />
                <span>Network</span>
              </NavLink>
              <NavLink
                to='/projects'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faCalendar} />
                <span>Projects</span>
              </NavLink>
              <NavLink
                to='/my-projects'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faFile} />
                <span>My Projects</span>
              </NavLink>
              <NavLink
                to='/notifications'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faBell} />
                <span>Notifications</span>
              </NavLink>
              <NavLink
                to='/candidates'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faRepeat} />
                <span>Candidates</span>
              </NavLink>
              <NavLink
                to={`/profile/${userId}`}
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faUser} />
                <span>Profile</span>
              </NavLink>
              <NavLink
                to='/chat'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faComments} />
                <span>Chat</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className='text-white flex flex-col items-center hover:text-[#21ADEA]'
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </nav>
      )}
      <ToastContainer position='top-right' autoClose={3000} />
    </>
  );
}

export default NavBar;
