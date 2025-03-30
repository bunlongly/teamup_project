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
  faTimes,
  faBars
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

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if ((searchExpanded || mobileMenuOpen) && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded, mobileMenuOpen]);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        axios
          .get(
            `http://localhost:5200/api/user/search?search=${encodeURIComponent(
              searchTerm
            )}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(res => {
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

  // Collapse search when clicking outside its container
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchExpanded(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle search expansion
  const toggleSearch = () => {
    setSearchExpanded(prev => {
      const newState = !prev;
      if (!newState) {
        setSearchTerm('');
        setSearchResults([]);
      }
      return newState;
    });
    setMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
    if (!mobileMenuOpen) {
      setSearchExpanded(false);
    }
  };

  // Handle search result click
  const handleResultClick = user => {
    navigate(`/profile/${user.id}`);
    setSearchTerm('');
    setSearchResults([]);
    setSearchExpanded(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {showNavBar && (
        <nav
          className='navBar  w-full z-50'
          style={{
            backgroundColor: '#0046b0',
            fontFamily: 'Poppins',
            fontWeight: 100,
            fontSize: 14
          }}
        >
          <div className='container mx-auto px-4 py-2 flex justify-between items-center'>
            {/* Left section: Logo + Search */}
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <div className='hidden sm:flex flex-col items-start'>
                <Khteamup khColor='#21ADEA' khFont={20} />
                <Slogan />
              </div>
              {/* Mobile Logo (shown only on small screens) */}
              <div className='sm:hidden'>
                <Khteamup khColor='#21ADEA' khFont={18} />
              </div>

              {/* Search container - Desktop */}
              <div
                className='relative hidden lg:flex items-center'
                ref={searchContainerRef}
              >
                <div
                  className='overflow-hidden transition-all duration-300 ease-in-out flex items-center'
                  style={{
                    width: searchExpanded
                      ? window.innerWidth < 640
                        ? '12rem'
                        : '20rem'
                      : '0rem'
                  }}
                >
                  <input
                    ref={searchInputRef}
                    type='text'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder='Search for users...'
                    className='bg-white rounded-l-full border border-gray-200 text-base text-gray-900 w-full px-3 py-1.5 focus:border-[#0046b0] focus:ring-2 focus:ring-[#0046b0]'
                  />
                  {/* Add Cancel button next to search input when expanded */}
              
                </div>
                {/* Toggle search button (magnifying glass) */}
                <button
                  onClick={toggleSearch}
                  className='ml-2 focus:outline-none'
                  aria-label={searchExpanded ? 'Close search' : 'Open search'}
                >
                  <FontAwesomeIcon
                    icon={searchExpanded ? faTimes : faSearch}
                    className='text-white text-xl sm:text-2xl'
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
                        <span className='truncate'>
                          {user.firstName} {user.lastName} ({user.username})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Desktop Nav Links (hidden below 1024px) */}
            <div className='hidden lg:flex items-center space-x-3 sm:space-x-4'>
              <NavLink
                to='/'
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faHome} className='text-lg' />
                <span className='text-xs mt-1'>Home</span>
              </NavLink>
              <NavLink
                to='/network'
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faGlobe} className='text-lg' />
                <span className='text-xs mt-1'>Network</span>
              </NavLink>
              <NavLink
                to='/projects'
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faCalendar} className='text-lg' />
                <span className='text-xs mt-1'>Projects</span>
              </NavLink>
              <NavLink
                to='/my-projects'
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faFile} className='text-lg' />
                <span className='text-xs mt-1'>My Projects</span>
              </NavLink>
              <NavLink
                to='/notifications'
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faBell} className='text-lg' />
                <span className='text-xs mt-1'>Notifications</span>
              </NavLink>
              <NavLink
                to='/candidates'
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faRepeat} className='text-lg' />
                <span className='text-xs mt-1'>Candidates</span>
              </NavLink>
              <NavLink
                to={`/profile/${userId}`}
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faUser} className='text-lg' />
                <span className='text-xs mt-1'>Profile</span>
              </NavLink>
              <NavLink
                to='/chat'
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 ${
                    isActive
                      ? 'text-[#21ADEA]'
                      : 'text-white hover:text-[#21ADEA]'
                  } transition-colors`
                }
              >
                <FontAwesomeIcon icon={faComments} className='text-lg' />
                <span className='text-xs mt-1'>Chat</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className='flex flex-col items-center p-2 text-white hover:text-[#21ADEA] transition-colors'
              >
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className='text-lg'
                />
                <span className='text-xs mt-1'>Log out</span>
              </button>
            </div>

            {/* Mobile Menu Toggle (below 1024px) */}
            <div className='lg:hidden flex items-center'>
              <button
                onClick={toggleMobileMenu}
                className='text-white text-2xl focus:outline-none p-2'
                aria-label='Menu'
              >
                <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
              </button>
            </div>
          </div>

          {/* Mobile Nav Overlay */}
          <div
            className={`lg:hidden fixed inset-0 bg-[#0046b0] transform transition-transform duration-300 ease-in-out z-40 pt-16 overflow-y-auto ${
              mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            <div className='container mx-auto px-4 py-4'>
              {/* Search in mobile menu */}
              <div className='relative mb-6 bg-white rounded-full px-4 py-2 flex items-center'>
                <FontAwesomeIcon
                  icon={faSearch}
                  className='text-gray-500 mr-2'
                />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Search for users...'
                  className='flex-1 bg-transparent text-gray-900 focus:outline-none'
                  ref={searchInputRef}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className='text-gray-500 ml-2'
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              {/* Conditionally show search results or menu items */}
              {searchResults.length > 0 ? (
                <div className='bg-white rounded-lg shadow-md p-2 max-h-60 overflow-y-auto'>
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleResultClick(user)}
                      className='flex items-center cursor-pointer p-2 hover:bg-blue-50 rounded'
                    >
                      {user.imageUrl && (
                        <img
                          src={user.imageUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className='w-8 h-8 rounded-full mr-2 object-cover'
                        />
                      )}
                      <span className='truncate'>
                        {user.firstName} {user.lastName} ({user.username})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Regular menu items when not searching */}
                  <NavLink
                    to='/'
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon icon={faHome} className='mr-3 text-lg' />
                    <span className='text-base'>Home</span>
                  </NavLink>
                  <NavLink
                    to='/network'
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon icon={faGlobe} className='mr-3 text-lg' />
                    <span className='text-base'>Network</span>
                  </NavLink>
                  <NavLink
                    to='/projects'
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className='mr-3 text-lg'
                    />
                    <span className='text-base'>Projects</span>
                  </NavLink>
                  <NavLink
                    to='/my-projects'
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon icon={faFile} className='mr-3 text-lg' />
                    <span className='text-base'>My Projects</span>
                  </NavLink>
                  <NavLink
                    to='/notifications'
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon icon={faBell} className='mr-3 text-lg' />
                    <span className='text-base'>Notifications</span>
                  </NavLink>
                  <NavLink
                    to='/candidates'
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon icon={faRepeat} className='mr-3 text-lg' />
                    <span className='text-base'>Candidates</span>
                  </NavLink>
                  <NavLink
                    to={`/profile/${userId}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon icon={faUser} className='mr-3 text-lg' />
                    <span className='text-base'>Profile</span>
                  </NavLink>
                  <NavLink
                    to='/chat'
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg ${
                        isActive
                          ? 'bg-[#003a8c] text-white'
                          : 'text-white hover:bg-[#003a8c]'
                      } transition-colors`
                    }
                  >
                    <FontAwesomeIcon
                      icon={faComments}
                      className='mr-3 text-lg'
                    />
                    <span className='text-base'>Chat</span>
                  </NavLink>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className='flex items-center p-3 rounded-lg text-white hover:bg-[#003a8c] transition-colors text-left w-full'
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className='mr-3 text-lg'
                    />
                    <span className='text-base'>Log out</span>
                  </button>
                </>
              )}

              {/* App Info in Mobile Menu - only shown when not showing search results */}
              {searchResults.length === 0 && (
                <div className='mt-8 pt-4 border-t border-[#003a8c]'>
                  <div className='flex flex-col items-center'>
                    <Khteamup khColor='#21ADEA' khFont={20} />
                    <Slogan />
                    <p className='text-white text-xs mt-2 text-center opacity-75'>
                      © {new Date().getFullYear()} KH TeamUp. All rights
                      reserved.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
      {/* Add padding to content when navbar is fixed */}
      {showNavBar && <div className='pt-16'></div>}
      <ToastContainer position='top-right' autoClose={3000} />
    </>
  );
}

export default NavBar;
