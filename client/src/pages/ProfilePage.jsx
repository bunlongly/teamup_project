import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import PersonalInfoSection from './PersonalInfoSection.jsx';
import EducationSection from './EducationSection.jsx';
import ExperienceSection from './ExperienceSection.jsx';
import SkillsSection from './SkillsSection.jsx';

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

  // Edit mode state for each section
  const [editMode, setEditMode] = useState({
    personal: false,
    education: false,
    experience: false,
    skills: false
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
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const userData = response.data.data;
        // Set personal info fields
        setPersonalInfo({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.username,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          location: userData.location,
          jobTitle: userData.jobTitle,
          bio: userData.bio,
          description: userData.description
        });
        // Set education, experience, and skills
        if (userData.education) setEducation(userData.education);
        if (userData.experience) {
          const transformedExperience = userData.experience.map(exp => ({
            company: exp.company,
            title: exp.position,
            startYear: new Date(exp.startDate).getFullYear().toString(),
            endYear: exp.endDate
              ? new Date(exp.endDate).getFullYear().toString()
              : 'Present'
          }));
          setExperience(transformedExperience);
        }
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
    console.log('User ID:', userId);

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
      if (updatedUser.education) setEducation(updatedUser.education);
      if (updatedUser.experience) {
        const mappedExp = updatedUser.experience.map(exp => ({
          company: exp.company,
          title: exp.position,
          startYear: new Date(exp.startDate).getFullYear().toString(),
          endYear: exp.endDate
            ? new Date(exp.endDate).getFullYear().toString()
            : 'Present'
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
        skills: false
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className='grid grid-cols-10 w-full mx-auto space-x-8 profile-page-container'>
      <div className='col-span-7 profile-page'>
        {/* Cover Photo */}
        <div
          className='profile-cover-photo'
          onClick={() => document.getElementById('coverPhotoInput').click()}
        >
          {coverPhoto ? (
            <img src={coverPhoto} alt='Cover' />
          ) : (
            <div className='cover-photo-placeholder'>
              <FontAwesomeIcon icon={faCamera} size='3x' />
              <p>Click to add cover photo</p>
            </div>
          )}
          <input
            type='file'
            id='coverPhotoInput'
            style={{ display: 'none' }}
            onChange={handleCoverPhotoChange}
          />
        </div>
        {/* Profile Picture */}
        <div
          className='profile-picture'
          onClick={() => document.getElementById('profilePictureInput').click()}
        >
          {profilePicture ? (
            <img src={profilePicture} alt='Profile' />
          ) : (
            <div className='profile-picture-placeholder'>
              <FontAwesomeIcon icon={faCamera} size='3x' />
              <p>Click to add profile picture</p>
            </div>
          )}
          <input
            type='file'
            id='profilePictureInput'
            style={{ display: 'none' }}
            onChange={handleProfilePictureChange}
          />
        </div>
        {/* Personal Information Section */}
        <PersonalInfoSection
          personalInfo={personalInfo}
          setPersonalInfo={setPersonalInfo}
          editMode={editMode.personal}
          setEditMode={flag =>
            setEditMode(prev => ({ ...prev, personal: flag }))
          }
          isOwner={true} // Since the owner is viewing their own profile
        />
        {/* Education Section */}
        <EducationSection
          education={education}
          setEducation={setEducation}
          editMode={editMode.education}
          setEditMode={flag =>
            setEditMode(prev => ({ ...prev, education: flag }))
          }
        />
        {/* Experience Section */}
        <ExperienceSection
          experience={experience}
          setExperience={setExperience}
          editMode={editMode.experience}
          setEditMode={flag =>
            setEditMode(prev => ({ ...prev, experience: flag }))
          }
        />
        {/* Skills Section */}
        <SkillsSection
          skills={skills}
          setSkills={setSkills}
          editMode={editMode.skills}
          setEditMode={flag => setEditMode(prev => ({ ...prev, skills: flag }))}
        />
        {/* Update Profile Button */}
        <div className='update-profile-button'>
          <button onClick={handleUpdateProfile}>Update Profile</button>
        </div>
      </div>
      <div className='col-span-3 profile-page-right'>
        {/* Additional content or sidebar */}
      </div>
    </div>
  );
}

export default Profile;
