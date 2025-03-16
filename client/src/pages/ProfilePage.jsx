import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import PersonalInfoSection from './PersonalInfoSection.jsx';
import EducationSection from './EducationSection.jsx';
import ExperienceSection from './ExperienceSection.jsx';
import SkillsSection from './SkillsSection.jsx';
import SocialLinksSection from './SocialLinksSection.jsx';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

function Profile() {
  const navigate = useNavigate();

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

  // On mount, fetch profile data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token is missing. Please log in.');
        navigate('/login');
        return;
      }
      let userId = localStorage.getItem('userId');
      if (!userId) {
        try {
          const decoded = jwtDecode(token);
          userId = decoded.userId;
          localStorage.setItem('userId', userId);
        } catch (err) {
          console.error('Error decoding token:', err);
          navigate('/login');
          return;
        }
      }
      try {
        const response = await axios.get(
          `http://localhost:5200/api/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userData = response.data.data;

        // Set personal info fields
        setPersonalInfo({
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
  }, [navigate]);

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

  // Global update profile handler
  const handleUpdateProfile = async () => {
    console.log('Update button clicked.');
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token is missing. Please log in.');
      navigate('/login');
      return;
    }
    let userId = localStorage.getItem('userId');
    if (!userId) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded.userId;
        localStorage.setItem('userId', userId);
      } catch (err) {
        console.error('Error decoding token:', err);
        navigate('/login');
        return;
      }
    }

    // Transform experience to include required "position" field
    const transformedExperience = experience.map(exp => ({
      ...exp,
      position: exp.title
    }));

    // Create FormData and append all fields and files
    const formData = new FormData();
    formData.append('firstName', personalInfo.firstName);
    formData.append('lastName', personalInfo.lastName);
    formData.append('email', personalInfo.email);
    formData.append('username', personalInfo.username);
    formData.append('phoneNumber', personalInfo.phoneNumber);
    formData.append('dateOfBirth', personalInfo.dateOfBirth);
    formData.append('location', personalInfo.location);
    formData.append('jobTitle', personalInfo.jobTitle);
    formData.append('bio', personalInfo.bio);
    formData.append('description', personalInfo.description);
    formData.append('socialLinks', JSON.stringify(socialLinks));
    formData.append('education', JSON.stringify(education));
    formData.append('experience', JSON.stringify(transformedExperience));
    formData.append('skills', JSON.stringify(skills));

    if (profilePictureFile) {
      formData.append('imageUrl', profilePictureFile);
    }
    if (coverPhotoFile) {
      formData.append('coverImage', coverPhotoFile);
    }

    try {
      const response = await axios.put(
        `http://localhost:5200/api/user/${userId}/edit`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Profile updated:', response.data);
      const updatedUser = response.data.data;
      // Update state with returned data
      setPersonalInfo({
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
      if (updatedUser.socialLinks) {
        setSocialLinks(updatedUser.socialLinks);
      }
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
    } catch (error) {
      console.error('Failed to update profile:', error);
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
        </div>
        <div className='mt-4 md:mt-0 md:ml-6 flex-1'>
          <h1 className='text-2xl font-bold'>
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <p className='text-gray-600'>
            {personalInfo.jobTitle ||
              'Work at Limkokwing University of Creative Technology'}
          </p>
          <p className='text-gray-500'>
            {personalInfo.location || 'Phnom Penh, Cambodia'}
          </p>
          <div className='mt-2'>
            <p className='text-blue-500 font-medium'>50 Connections</p>
            <p className='text-gray-500 text-sm'>
              Contact info: {personalInfo.email}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Two-Column Layout */}
      <div className='mt-6 px-4 md:px-8 grid grid-cols-12 gap-4'>
        {/* LEFT COLUMN (col-span-8) */}
        <div className='col-span-12 md:col-span-8 space-y-4'>
          {/* Personal Info Section */}
          <div className='bg-white rounded-lg shadow p-4'>
            <PersonalInfoSection
              personalInfo={personalInfo}
              setPersonalInfo={setPersonalInfo}
              editMode={editMode.personal}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, personal: flag }))
              }
              isOwner={true}
            />
          </div>
          {/* Education Section */}
          <div className='bg-white rounded-lg shadow p-4'>
            <EducationSection
              education={education}
              setEducation={setEducation}
              editMode={editMode.education}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, education: flag }))
              }
            />
          </div>
          {/* Experience Section */}
          <div className='bg-white rounded-lg shadow p-4'>
            <ExperienceSection
              experience={experience}
              setExperience={setExperience}
              editMode={editMode.experience}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, experience: flag }))
              }
            />
          </div>
          {/* Skills Section */}
          <div className='bg-white rounded-lg shadow p-4'>
            <SkillsSection
              skills={skills}
              setSkills={setSkills}
              editMode={editMode.skills}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, skills: flag }))
              }
            />
          </div>
        </div>

        {/* RIGHT COLUMN (col-span-4) */}
        <div className='col-span-12 md:col-span-4 space-y-4'>
          {/* Profile URL Section */}
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

          {/* Social Links Section */}
          <div className='bg-white rounded-lg shadow p-4'>
            <SocialLinksSection
              socialLinks={socialLinks}
              setSocialLinks={newLinks => setSocialLinks(newLinks)}
              editMode={editMode.social}
              setEditMode={flag =>
                setEditMode(prev => ({ ...prev, social: flag }))
              }
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

      {/* Footer Update Button */}
      <div className='px-4 md:px-8 mt-6 mb-10'>
        <button
          onClick={handleUpdateProfile}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow'
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}

export default Profile;
