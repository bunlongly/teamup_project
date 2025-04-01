import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import Khteamup from '../components/Khteamup';
import Slogan from '../components/Slogan';
import logo from '../assets/logo.png';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: 'testing',
    lastName: '123',
    phoneNumber: '',
    email: 'test123@gmail.com',
    password: '123456789',
    confirmPassword: '123456789',
    username: 'testing1'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  // Handle form input changes
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle phone number change
  const handlePhoneNumberChange = value => {
    setFormData({ ...formData, phoneNumber: value });
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      const response = await axios.post(
        'http://localhost:5200/api/auth/register',
        formData
      );

      if (response.status === 201) {
        toast.success('User registered successfully!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
        setTimeout(() => navigate('/signin'), 2000); // Redirect after 2 seconds
      }
    } catch (err) {
      const errorResponse =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      const validationErrors = err.response?.data?.errors || []; 

      // Convert array of errors into an object for easier display
      const formattedErrors = {};
      validationErrors.forEach(error => {
        if (error.toLowerCase().includes('email')) {
          formattedErrors.email = error;
        } else if (error.toLowerCase().includes('username')) {
          formattedErrors.username = error;
        } else if (error.toLowerCase().includes('password')) {
          formattedErrors.password = error;
        } else if (error.toLowerCase().includes('phone')) {
          formattedErrors.phoneNumber = error;
        }
      });

      toast.error(errorResponse, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });

      setErrors(formattedErrors); // Set validation errors
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className='grid grid-cols-10 w-full main-container'>
      <div className='col-span-7 left-col'>
        <div className='title-container'>
          <h1 className='text-2xl font-bold mb-4'>Sign Up</h1>
        </div>
        <div className='form-container'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor='firstName'
                className='block text-sm font-medium text-gray-700'
              >
                First Name
              </label>
              <input
                type='text'
                id='firstName'
                name='firstName'
                placeholder='First Name'
                value={formData.firstName}
                onChange={handleChange}
                className='mt-1 block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-600 focus:ring-2 focus:ring-blue-500'
              />
              {errors.firstName && (
                <p className='text-red-500 text-sm'>{errors.firstName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='lastName'
                className='block text-sm font-medium text-gray-700'
              >
                Last Name
              </label>
              <input
                type='text'
                id='lastName'
                name='lastName'
                placeholder='Last Name'
                value={formData.lastName}
                onChange={handleChange}
                className='mt-1 block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-600 focus:ring-2 focus:ring-blue-500'
              />
              {errors.lastName && (
                <p className='text-red-500 text-sm'>{errors.lastName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700'
              >
                Username
              </label>
              <input
                type='text'
                id='username'
                name='username'
                placeholder='Username'
                value={formData.username}
                onChange={handleChange}
                className='mt-1 block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-600 focus:ring-2 focus:ring-blue-500'
              />
              {errors.username && (
                <p className='text-red-500 text-sm'>{errors.username}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='phoneNumber'
                className='block text-sm font-medium text-gray-700'
              >
                Phone Number
              </label>
              <PhoneInput
                international
                defaultCountry='US' // Set default country
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                id='phoneNumber'
                name='phoneNumber'
                placeholder='Enter phone number'
              />
              {errors.phoneNumber && (
                <p className='text-red-500 text-sm'>{errors.phoneNumber}</p>
              )}
            </div>
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
              {errors.password && (
                <p className='text-red-500 text-sm'>{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700'
              >
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id='confirmPassword'
                  name='confirmPassword'
                  placeholder='Confirm Password'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='mt-1 block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-600 focus:ring-2 focus:ring-blue-500'
                />
                <button
                  type='button'
                  onClick={toggleConfirmPasswordVisibility}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-red-500 text-sm'>{errors.confirmPassword}</p>
              )}
            </div>
            <div className='flex justify-center'>
              <button
                style={{ backgroundColor: '#0046b0' }}
                type='submit'
                className='rounded-md px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors'
              >
                Sign Up
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
          <h1 className='newhere'>Sign In Now</h1>
          <h6 className='text'>
            Sign in and discover a great amount of opportunities.
          </h6>
          <button
            type='button'
            onClick={() => navigate('/signin')}
            className='rounded-md px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors'
            style={{ backgroundColor: '#0046b0' }}
          >
            Sign In
          </button>
        </div>
      </div>
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default SignUpPage;
