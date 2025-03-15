import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faGlobe,
  faCalendar,
  faFile,
  faBell,
  faRepeat,
  faUser,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Khteamup from './Khteamup';
import Slogan from './Slogan';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Add this import for toast styles
import { useEffect, useState } from 'react'; // Import useEffect and useState

function NavBar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token')); // Use state to manage token

  // Effect to listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Logout handler with toast notifications
  const handleLogout = async () => {
    try {
      // Show loading toast while logout is processing
      const logoutToastId = toast.loading('Logging out...');

      // Call the backend logout endpoint
      await axios.post(
        'http://localhost:5200/api/auth/logout',
        {},
        {
          withCredentials: true
        }
      );

      // Clear the token from localStorage
      localStorage.removeItem('token');

      // Update toast to success
      toast.update(logoutToastId, {
        render: 'Successfully logged out!',
        type: 'success',
        isLoading: false,
        autoClose: 2000, // Close after 2 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true
      });

      // Redirect to sign-in page after a short delay to show the toast
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error) {
      console.error('Logout failed:', error);

      // Show error toast
      toast.error('Failed to log out. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true
      });
    }
  };

  // We will show the NavBar only if the user is logged in (token exists) and not on /signup or /signin pages
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
                className='bg-white rounded-md px-3 py-1.5 text-base text-gray-900 outline-none focus:outline-none w-100'
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
                to='/profile'
                className={({ isActive }) =>
                  isActive
                    ? 'text-[#21ADEA] flex flex-col items-center'
                    : 'text-white flex flex-col items-center'
                }
              >
                <FontAwesomeIcon icon={faUser} />
                <span>Profile</span>
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
      {/* Add ToastContainer to display the notifications */}
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default NavBar;
