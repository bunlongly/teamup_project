import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/logo.png';
import Khteamup from '../components/Khteamup';
import Slogan from '../components/Slogan';
import { jwtDecode } from 'jwt-decode';

function SignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'test001@gmail.com',
    password: '123456789'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await axios.post(
        'http://localhost:5200/api/auth/login',
        formData
      );
      console.log('Full Response:', response);

      if (response.status === 200 && response.data.success) {
        // Extract token from the response
        const token = response.data.data.token;
        console.log('Extracted Token:', token);

        if (token) {
          // Store token in localStorage
          localStorage.setItem('token', token);

          // Decode token to get userId
          const decoded = jwtDecode(token);
          const userId = decoded.userId;
          toast.success('Login successful!', {
            position: 'top-right',
            autoClose: 2000
          });

          // Navigate to the dynamic profile route
          setTimeout(() => navigate(`/profile/${userId}`), 2000);
        } else {
          throw new Error('No token received from server');
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
      const errorResponse =
        err.response?.data?.message || 'Invalid credentials. Please try again.';
      setErrors({ email: errorResponse });
      toast.error(errorResponse, {
        position: 'top-right',
        autoClose: 5000
      });
    }
  };

  return (
    <div className='grid grid-cols-10 w-full main-container'>
      <div className='col-span-7 left-col'>
        <div className='title-container'>
          <h1 className='text-2xl font-bold mb-4'>Sign In</h1>
        </div>
        <div className='form-container'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                placeholder='Email'
                value={formData.email}
                onChange={handleChange}
                className='mt-1 block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-600 focus:ring-2 focus:ring-blue-500'
              />
              {errors.email && (
                <p className='text-red-500 text-sm'>{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  name='password'
                  placeholder='Password'
                  value={formData.password}
                  onChange={handleChange}
                  className='mt-1 block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-600 focus:ring-2 focus:ring-blue-500'
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className='flex justify-center'>
              <button
                style={{ backgroundColor: '#0046b0' }}
                type='submit'
                className='rounded-md px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors'
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className='col-span-3 right-col'>
        <div className='mb-4'>
          <img src={logo} width={70} alt='Logo' />
        </div>
        <div className='title'>
          <Khteamup />
        </div>
        <div className='slogan'>
          <Slogan />
        </div>
        <div className='signup'>
          <h1 className='newhere'>Sign Up Now</h1>
          <h6 className='text'>
            Create an account and start your journey with us.
          </h6>
          <button
            type='button'
            onClick={() => navigate('/signup')}
            className='rounded-md px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors'
            style={{ backgroundColor: '#0046b0' }}
          >
            Sign Up
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SignInPage;
