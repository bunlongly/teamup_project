// Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConnectionButton from '../components/ConnectionButton.jsx';

import PersonalInfoSection from './PersonalInfoSection.jsx';
import EducationSection from './EducationSection.jsx';
import ExperienceSection from './ExperienceSection.jsx';
import SkillsSection from './SkillsSection.jsx';
import SocialLinksSection from './SocialLinksSection.jsx';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

function Profile() {
  const navigate = useNavigate();
  const { id: profileId } = useParams(); // Get profile id from URL if available
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  // Determine if the current user is the profile owner.
  // If there's no profileId in URL or profileId matches current user's id, then it's the owner.
  const isOwner = !profileId || profileId === currentUserId;

  // States for images
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);

  // States for relation data
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);

  // State for personal info (from User model)
  const [personalInfo, setPersonalInfo] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phoneNumber: '',
    dateOfBirth: '',
    location: '',
    jobTitle: '',
    bio: '',
    description: ''
  });

  // New state for social links
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    twitter: '',
    youtube: '',
    facebook: '',
    instagram: '',
    portfolio: ''
  });

  // Edit mode state for each section
  const [editMode, setEditMode] = useState({
    personal: false,
    education: false,
    experience: false,
    skills: false,
    social: false
  });

  // Fetch profile data on mount or when profileId changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        console.error('Token is missing. Please log in.');
        navigate('/login');
        return;
      }
      // Use profileId from URL if provided; otherwise, use current user's id.
      const userIdToFetch = profileId || currentUserId;
      if (!userIdToFetch) {
        try {
          const decoded = jwtDecode(token);
          localStorage.setItem('userId', decoded.userId);
        } catch (err) {
          console.error('Error decoding token:', err);
          navigate('/login');
          return;
        }
      }
      try {
        const response = await axios.get(
          `http://localhost:5200/api/user/${userIdToFetch}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userData = response.data.data;
        console.log('Fetched user data:', userData);

        // Set personal info fields
        setPersonalInfo({
          id: userData.id || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          username: userData.username || '',
          phoneNumber: userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth || '',
          location: userData.location || '',
          jobTitle: userData.jobTitle || '',
          bio: userData.bio || '',
          description: userData.description || ''
        });

        // Set social links (if available)
        setSocialLinks(
          userData.socialLinks || {
            github: '',
            twitter: '',
            youtube: '',
            facebook: '',
            instagram: '',
            portfolio: ''
          }
        );

        // Set education
        if (userData.education) setEducation(userData.education);

        // Set experience (transform and include employmentType, description)
        if (userData.experience) {
          const transformedExperience = userData.experience.map(exp => ({
            company: exp.company,
            title: exp.position,
            startYear: new Date(exp.startDate).getFullYear().toString(),
            endYear: exp.endDate
              ? new Date(exp.endDate).getFullYear().toString()
              : 'Present',
            employmentType: exp.employmentType || '',
            description: exp.description || ''
          }));
          setExperience(transformedExperience);
        }

        // Set skills
        if (userData.userSkills) {
          const transformedSkills = userData.userSkills.map(
            us => us.skill.skillName
          );
          setSkills(transformedSkills);
        }

        // Set images (assume API returns fields "imageUrl" and "coverImage")
        if (userData.imageUrl) setProfilePicture(userData.imageUrl);
        if (userData.coverImage) setCoverPhoto(userData.coverImage);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [profileId, currentUserId, navigate, token]);

  // File change handlers
  const handleProfilePictureChange = e => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
      setProfilePictureFile(file);
    }
  };

  const handleCoverPhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(URL.createObjectURL(file));
      setCoverPhotoFile(file);
    }
  };

  // Global update profile handler (only for current user's profile)
  const handleUpdateProfile = async () => {
    console.log('Update button clicked.');
    if (!token) {
      console.error('Token is missing. Please log in.');
      navigate('/login');
      return;
    }
    const userIdToUpdate = currentUserId; // only allow the current user to update their own profile
    const transformedExperience = experience.map(exp => ({
      ...exp,
      position: exp.title
    }));
    const formDataToSend = new FormData();
    formDataToSend.append('firstName', personalInfo.firstName);
    formDataToSend.append('lastName', personalInfo.lastName);
    formDataToSend.append('email', personalInfo.email);
    formDataToSend.append('username', personalInfo.username);
    formDataToSend.append('phoneNumber', personalInfo.phoneNumber);
    formDataToSend.append('dateOfBirth', personalInfo.dateOfBirth);
    formDataToSend.append('location', personalInfo.location);
    formDataToSend.append('jobTitle', personalInfo.jobTitle);
    formDataToSend.append('bio', personalInfo.bio);
    formDataToSend.append('description', personalInfo.description);
    formDataToSend.append('socialLinks', JSON.stringify(socialLinks));
    formDataToSend.append('education', JSON.stringify(education));
    formDataToSend.append('experience', JSON.stringify(transformedExperience));
    formDataToSend.append('skills', JSON.stringify(skills));

    if (profilePictureFile) {
      formDataToSend.append('imageUrl', profilePictureFile);
    }
    if (coverPhotoFile) {
      formDataToSend.append('coverImage', coverPhotoFile);
    }

    try {
      const response = await axios.put(
        `http://localhost:5200/api/user/${userIdToUpdate}/edit`,
        formDataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Profile updated:', response.data);
      const updatedUser = response.data.data;
      setPersonalInfo({
        id: updatedUser.id || '',
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        username: updatedUser.username,
        phoneNumber: updatedUser.phoneNumber,
        dateOfBirth: updatedUser.dateOfBirth,
        location: updatedUser.location,
        jobTitle: updatedUser.jobTitle,
        bio: updatedUser.bio,
        description: updatedUser.description
      });
      if (updatedUser.socialLinks) setSocialLinks(updatedUser.socialLinks);
      if (updatedUser.education) setEducation(updatedUser.education);
      if (updatedUser.experience) {
        const mappedExp = updatedUser.experience.map(exp => ({
          company: exp.company,
          title: exp.position,
          startYear: new Date(exp.startDate).getFullYear().toString(),
          endYear: exp.endDate
            ? new Date(exp.endDate).getFullYear().toString()
            : 'Present',
          employmentType: exp.employmentType || '',
          description: exp.description || ''
        }));
        setExperience(mappedExp);
      }
      if (updatedUser.userSkills) {
        const mappedSkills = updatedUser.userSkills.map(
          us => us.skill.skillName
        );
        setSkills(mappedSkills);
      }
      // Turn off edit mode for all sections
      setEditMode({
        personal: false,
        education: false,
        experience: false,
        skills: false,
        social: false
      });
      toast.success('Profile updated successfully!', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.', {
        position: 'top-right',
        autoClose: 5000
      });
    }
  };

  return (
    <div className='w-full mx-auto'>
      {/* Cover Photo Section */}
      <div className='relative h-60 bg-gray-200'>
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt='Cover'
            className='object-cover w-full h-full'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gray-300'>
            <FontAwesomeIcon
              icon={faCamera}
              size='3x'
              className='text-gray-600'
            />
            <p className='ml-2 text-gray-600'>Click to add cover photo</p>
          </div>
        )}
        {/* Only show cover photo change button if owner */}
        {isOwner && (
          <>
            <input
              type='file'
              id='coverPhotoInput'
              style={{ display: 'none' }}
              onChange={handleCoverPhotoChange}
            />
            <button
              className='absolute top-2 right-2 px-3 py-1 bg-white text-sm text-gray-700 shadow'
              onClick={() => document.getElementById('coverPhotoInput').click()}
            >
              Change Cover
            </button>
          </>
        )}
      </div>

      {/* Profile Picture + Basic Info */}
      <div className='flex flex-col md:flex-row items-center md:items-start px-4 md:px-8 -mt-12 md:-mt-8'>
        <div className='relative'>
          {profilePicture ? (
            <img
              src={profilePicture}
              alt='Profile'
              className='w-32 h-32 rounded-full border-4 border-white object-cover'
            />
          ) : (
            <div className='w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center'>
              <FontAwesomeIcon
                icon={faCamera}
                size='2x'
                className='text-gray-600'
              />
            </div>
          )}
          {/* Only show profile picture change if owner */}
          {isOwner && (
            <>
              <input
                type='file'
                id='profilePictureInput'
                style={{ display: 'none' }}
                onChange={handleProfilePictureChange}
              />
              <button
                className='absolute bottom-0 right-0 bg-white px-2 py-1 text-sm shadow'
                onClick={() =>
                  document.getElementById('profilePictureInput').click()
                }
              >
                Change
              </button>
            </>
          )}
        </div>
        <div className='mt-10 md:mt-10 md:ml-6 flex-1'>
          <h1 className='text-2xl font-bold'>
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <p className='text-gray-600'>
            {personalInfo.username || 'Your username here'}
          </p>
          <p className='text-gray-600'>
            {personalInfo.jobTitle || 'Your job title here'}
          </p>
          <p className='text-gray-500'>
            {personalInfo.location || 'Your location here'}
          </p>
          <div className='mt-2'>
            <p className='text-blue-500 font-medium'>50 Connections</p>
            <p className='text-gray-500 text-sm'>
              Contact info: {personalInfo.email}
            </p>
          </div>
          {/* Render ConnectionButton only if not owner */}
          {personalInfo.id && personalInfo.id !== currentUserId && (
            <div className='mt-4'>
              <ConnectionButton profileUserId={personalInfo.id} />
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Two-Column Layout */}
      <div className='mt-6 px-4 md:px-8 grid grid-cols-12 gap-4'>
        {/* LEFT COLUMN */}
        <div className='col-span-12 md:col-span-8 space-y-4'>
          <div className='bg-white rounded-lg shadow p-4'>
            <PersonalInfoSection
              personalInfo={personalInfo}
              setPersonalInfo={setPersonalInfo}
              editMode={editMode.personal}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, personal: flag }))
              }
              isOwner={isOwner}
            />
          </div>
          <div className='bg-white rounded-lg shadow p-4'>
            <EducationSection
              education={education}
              setEducation={setEducation}
              editMode={editMode.education}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, education: flag }))
              }
              isOwner={isOwner}
            />
          </div>
          <div className='bg-white rounded-lg shadow p-4'>
            <ExperienceSection
              experience={experience}
              setExperience={setExperience}
              editMode={editMode.experience}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, experience: flag }))
              }
              isOwner={isOwner}
            />
          </div>
          <div className='bg-white rounded-lg shadow p-4'>
            <SkillsSection
              skills={skills}
              setSkills={setSkills}
              editMode={editMode.skills}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, skills: flag }))
              }
              isOwner={isOwner}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className='col-span-12 md:col-span-4 space-y-4'>
          <div className='bg-white rounded-lg shadow p-4'>
            <h3 className='text-lg font-semibold mb-2'>Profile URL</h3>
            <p className='text-sm text-gray-500'>
              Your public profile can be accessed at:
            </p>
            <a
              href={`https://yourdomain.com/profile/${personalInfo.username}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline'
            >
              https://yourdomain.com/profile/{personalInfo.username}
            </a>
          </div>
          <div className='bg-white rounded-lg shadow p-4'>
            <SocialLinksSection
              socialLinks={socialLinks}
              setSocialLinks={newLinks => setSocialLinks(newLinks)}
              editMode={editMode.social}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, social: flag }))
              }
              isOwner={isOwner}
            />
          </div>
          <div className='bg-white rounded-lg shadow p-4'>
            <h3 className='text-lg font-semibold mb-2'>Connection Suggest</h3>
            <p className='text-sm text-gray-500'>
              People you may know or want to connect with.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Update Button (only for owner) */}
      {isOwner && (
        <div className='px-4 md:px-8 mt-6 mb-10'>
          <button
            onClick={handleUpdateProfile}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow'
          >
            Update Profile
          </button>
        </div>
      )}

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
    </div>
  );
}

export default Profile;
