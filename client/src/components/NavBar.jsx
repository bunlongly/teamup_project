// NavBar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
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
  faComments,
  faSearch,
  faTimes
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

  // Search-related states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Decode token to get userId and store it in state/localStorage
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

  // Focus the input when search expands
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      console.log('Search expanded: focusing input.');
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  // Debounced search effect
  useEffect(() => {
    console.log(
      'Debounced search effect triggered. Current searchTerm:',
      searchTerm
    );
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        console.log('Performing search for:', searchTerm);
        axios
          .get(
            `http://localhost:5200/api/user/search?search=${encodeURIComponent(
              searchTerm
            )}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(res => {
            console.log('Search results received:', res.data.data);
            setSearchResults(res.data.data);
          })
          .catch(error => {
            console.error('Error searching users:', error);
          });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, token]);

  // Outside click: collapse search if click is outside search container
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        console.log('Clicked outside search container. Collapsing search.');
        setSearchExpanded(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle search expansion/collapse
  const toggleSearch = () => {
    setSearchExpanded(prev => {
      const newState = !prev;
      console.log('Toggling search. New expanded state:', newState);
      if (!newState) {
        setSearchTerm('');
        setSearchResults([]);
      }
      return newState;
    });
  };

  // When a search result is clicked
  const handleResultClick = user => {
    console.log('Result clicked:', user);
    navigate(`/profile/${user.id}`);
    setSearchTerm('');
    setSearchResults([]);
    setSearchExpanded(false);
  };

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
          <div className='container mx-auto px-4 py-2 flex justify-between items-center relative'>
            <div className='flex items-center space-x-4'>
              <div className='flex flex-col items-start'>
                <Khteamup khColor='#21ADEA' khFont={20} />
                <Slogan />
              </div>
              {/* Search container */}
              <div
                className='relative flex items-center'
                ref={searchContainerRef}
              >
                {/* Input wrapper with animated width (no overflow-hidden on the whole container) */}
                <div
                  className='overflow-hidden transition-all duration-300 ease-in-out'
                  style={{ width: searchExpanded ? '20rem' : '0rem' }}
                >
                  <input
                    ref={searchInputRef}
                    type='text'
                    value={searchTerm}
                    onChange={e => {
                      console.log('Input changed:', e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                    placeholder='Search for users...'
                    className='bg-white rounded-full border border-gray-200 text-base text-gray-900 w-full px-3 py-1.5 transition-all duration-300 ease-in-out focus:border-[#0046b0] focus:ring-2 focus:ring-[#0046b0]'
                  />
                </div>
                <button
                  onClick={toggleSearch}
                  className='ml-2 focus:outline-none'
                >
                  <FontAwesomeIcon
                    icon={searchExpanded ? faTimes : faSearch}
                    className='text-white text-2xl'
                  />
                </button>
                {/* Dropdown for search results */}
                {searchResults.length > 0 && searchExpanded && (
                  <ul className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-50 max-h-60 overflow-y-auto'>
                    {searchResults.map(user => (
                      <li
                        key={user.id}
                        onClick={() => handleResultClick(user)}
                        className='flex items-center cursor-pointer px-4 py-2 hover:bg-blue-50 transition-colors'
                      >
                        {user.imageUrl && (
                          <img
                            src={user.imageUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className='w-8 h-8 rounded-full mr-2 object-cover'
                          />
                        )}
                        <span>
                          {user.firstName} {user.lastName} ({user.username})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
