import { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

function Profile() {
  const navigate = useNavigate();

  // States for image previews and file objects
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);

  // Other state variables
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);

  const [editMode, setEditMode] = useState({
    education: false,
    experience: false,
    skills: false,
    portfolio: false
  });

  // Fetch user data on component mount
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
        // Fetch user profile data
        const response = await axios.get(
          `http://localhost:5200/api/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const userData = response.data.data;

        // Set education
        if (userData.education) {
          setEducation(userData.education);
        }

        // Set experience (transform if necessary)
        if (userData.experience) {
          const transformedExperience = userData.experience.map(exp => ({
            company: exp.company,
            title: exp.position, // Map "position" to "title"
            startYear: new Date(exp.startDate).getFullYear().toString(),
            endYear: exp.endDate
              ? new Date(exp.endDate).getFullYear().toString()
              : 'Present'
          }));
          setExperience(transformedExperience);
        }

        // Set skills (transform if necessary)
        if (userData.userSkills) {
          const transformedSkills = userData.userSkills.map(
            us => us.skill.skillName
          );
          setSkills(transformedSkills);
        }

        // Set profile picture and cover photo if available
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture);
        }
        if (userData.coverPhoto) {
          setCoverPhoto(userData.coverPhoto);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]); // Add navigate to dependency array

  // Handlers for file changes – store both preview URL and file object
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

  // Handlers for adding new items
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { school: '', degree: '', startYear: '', endYear: '' }
    ]);
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { company: '', title: '', startYear: '', endYear: '' }
    ]);
  };

  const handleAddSkill = () => {
    setSkills([...skills, '']);
  };

  // Handlers for updating items
  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  // Handlers for deleting items
  const handleDeleteEducation = index => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleDeleteExperience = index => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleDeleteSkill = index => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Handler for updating the profile
  const handleUpdateProfile = async () => {
    console.log('Update button clicked.');

    // Retrieve token from localStorage
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
      console.error('Token is missing. Please log in.');
      navigate('/login');
      return;
    }

    // Decode the token to extract the userId if not already stored
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

    // Transform the experience array to include the required "position" field.
    const transformedExperience = experience.map(exp => ({
      ...exp,
      position: exp.title // Map "title" to "position"
    }));

    // Create FormData to combine text fields and file uploads
    const formData = new FormData();
    formData.append('education', JSON.stringify(education));
    formData.append('experience', JSON.stringify(transformedExperience));
    formData.append('skills', JSON.stringify(skills));

    // Append files if available
    if (profilePictureFile) {
      formData.append('image', profilePictureFile);
    }
    if (coverPhotoFile) {
      formData.append('coverImage', coverPhotoFile);
    }

    try {
      // Send PUT request to update the profile
      const response = await axios.put(
        `http://localhost:5200/api/user/${userId}/edit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Profile updated:', response.data);

      // Assuming your API returns the updated user data in response.data.data,
      // update your state to reflect the real data.
      const updatedUser = response.data.data;

      // Update local state with the real data from the backend.
      if (updatedUser.education) setEducation(updatedUser.education);
      if (updatedUser.experience) {
        // Map backend experience (if necessary) to match your local format.
        const mappedExp = updatedUser.experience.map(exp => ({
          company: exp.company,
          title: exp.position, // map "position" to "title"
          startYear: new Date(exp.startDate).getFullYear().toString(),
          endYear: exp.endDate
            ? new Date(exp.endDate).getFullYear().toString()
            : 'Present'
        }));
        setExperience(mappedExp);
      }
      if (updatedUser.userSkills) {
        // Assuming updatedUser.userSkills is an array of objects containing a "skill" property.
        const mappedSkills = updatedUser.userSkills.map(
          us => us.skill.skillName
        );
        setSkills(mappedSkills);
      }

      setEditMode({
        education: false,
        experience: false,
        skills: false,
        portfolio: false
      });
      // Optionally navigate to a different page or keep the user on the same page.
      // navigate(`/profile/${userId}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className='grid grid-cols-10 w-full mx-auto space-x-8 profile-page-container'>
      <div className='col-span-7 profile-page'>
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
            onChange={handleCoverPhotoChange}
            style={{ display: 'none' }}
            id='coverPhotoInput'
          />
        </div>
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
            onChange={handleProfilePictureChange}
            style={{ display: 'none' }}
            id='profilePictureInput'
          />
        </div>
        <div className='profile-education-section'>
          <div className='section-header'>
            <h3>Education</h3>
            <FontAwesomeIcon
              icon={faPen}
              onClick={() =>
                setEditMode({ ...editMode, education: !editMode.education })
              }
              className='edit-icon'
            />
          </div>
          {education.map((edu, index) => (
            <div key={index} className='profile-education-item'>
              {editMode.education ? (
                <>
                  <input
                    type='text'
                    placeholder='School'
                    value={edu.school}
                    onChange={e =>
                      handleEducationChange(index, 'school', e.target.value)
                    }
                  />
                  <input
                    type='text'
                    placeholder='Degree'
                    value={edu.degree}
                    onChange={e =>
                      handleEducationChange(index, 'degree', e.target.value)
                    }
                  />
                  <input
                    type='text'
                    placeholder='Start Year'
                    value={edu.startYear}
                    onChange={e =>
                      handleEducationChange(index, 'startYear', e.target.value)
                    }
                  />
                  <input
                    type='text'
                    placeholder='End Year'
                    value={edu.endYear}
                    onChange={e =>
                      handleEducationChange(index, 'endYear', e.target.value)
                    }
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => handleDeleteEducation(index)}
                    className='delete-icon'
                  />
                </>
              ) : (
                <div>
                  <p>School: {edu.school}</p>
                  <p>Degree: {edu.degree}</p>
                  <p>Start Year: {edu.startYear}</p>
                  <p>End Year: {edu.endYear}</p>
                </div>
              )}
            </div>
          ))}
          {editMode.education && (
            <button onClick={handleAddEducation}>Add Education</button>
          )}
        </div>
        <div className='profile-experience-section'>
          <div className='section-header'>
            <h3>Experience</h3>
            <FontAwesomeIcon
              icon={faPen}
              onClick={() =>
                setEditMode({ ...editMode, experience: !editMode.experience })
              }
              className='edit-icon'
            />
          </div>
          {experience.map((exp, index) => (
            <div key={index} className='profile-experience-item'>
              {editMode.experience ? (
                <>
                  <input
                    type='text'
                    placeholder='Company'
                    value={exp.company}
                    onChange={e =>
                      handleExperienceChange(index, 'company', e.target.value)
                    }
                  />
                  <input
                    type='text'
                    placeholder='Title'
                    value={exp.title}
                    onChange={e =>
                      handleExperienceChange(index, 'title', e.target.value)
                    }
                  />
                  <input
                    type='text'
                    placeholder='Start Year'
                    value={exp.startYear}
                    onChange={e =>
                      handleExperienceChange(index, 'startYear', e.target.value)
                    }
                  />
                  <input
                    type='text'
                    placeholder='End Year'
                    value={exp.endYear}
                    onChange={e =>
                      handleExperienceChange(index, 'endYear', e.target.value)
                    }
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => handleDeleteExperience(index)}
                    className='delete-icon'
                  />
                </>
              ) : (
                <div>
                  <p>Company: {exp.company}</p>
                  <p>Title: {exp.title}</p>
                  <p>Start Year: {exp.startYear}</p>
                  <p>End Year: {exp.endYear}</p>
                </div>
              )}
            </div>
          ))}
          {editMode.experience && (
            <button onClick={handleAddExperience}>Add Experience</button>
          )}
        </div>
        <div className='profile-skills-section'>
          <div className='section-header'>
            <h3>Skills</h3>
            <FontAwesomeIcon
              icon={faPen}
              onClick={() =>
                setEditMode({ ...editMode, skills: !editMode.skills })
              }
              className='edit-icon'
            />
          </div>
          {skills.map((skill, index) => (
            <div key={index} className='profile-skill-item'>
              {editMode.skills ? (
                <>
                  <input
                    type='text'
                    placeholder='Skill'
                    value={skill}
                    onChange={e => handleSkillChange(index, e.target.value)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => handleDeleteSkill(index)}
                    className='delete-icon'
                  />
                </>
              ) : (
                <p>Skill: {skill}</p>
              )}
            </div>
          ))}
          {editMode.skills && (
            <button onClick={handleAddSkill}>Add Skill</button>
          )}
        </div>

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
