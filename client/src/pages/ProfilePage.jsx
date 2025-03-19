import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

function Profile() {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [editMode, setEditMode] = useState({
    education: false,
    experience: false,
    skills: false,
    portfolio: false,
  });

  const handleProfilePictureChange = (e) => {
    setProfilePicture(URL.createObjectURL(e.target.files[0]));
  };

  const handleCoverPhotoChange = (e) => {
    setCoverPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { school: "", degree: "", field: "", startYear: "", endYear: "" },
    ]);
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { company: "", title: "", startYear: "", endYear: "" },
    ]);
  };

  const handleAddSkill = () => {
    setSkills([...skills, ""]);
  };

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

  const handleDeleteEducation = (index) => {
    const newEducation = education.filter((_, i) => i !== index);
    setEducation(newEducation);
  };

  const handleDeleteExperience = (index) => {
    const newExperience = experience.filter((_, i) => i !== index);
    setExperience(newExperience);
  };

  const handleDeleteSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const handleUpdateProfile = () => {
    setEditMode({
      education: false,
      experience: false,
      skills: false,
      portfolio: false,
    });
  };

  const handleApplyForJob = (jobDetails) => {
    const candidateProfile = {
      profilePicture,
      coverPhoto,
      education,
      experience,
      skills,
      portfolioLink,
    };
    navigate("/candidates", { state: { ...jobDetails, candidateProfile } });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 w-full mx-auto space-y-8 lg:space-y-0 lg:space-x-8 profile-page-container">
      <div className="col-span-1 lg:col-span-7 profile-page">
        <div className="profile-cover-photo" onClick={() => document.getElementById('coverPhotoInput').click()}>
          {coverPhoto ? (
            <img src={coverPhoto} alt="Cover" />
          ) : (
            <div className="cover-photo-placeholder">
              <FontAwesomeIcon icon={faCamera} size="3x" />
              <p>Click to add cover photo</p>
            </div>
          )}
          <input type="file" onChange={handleCoverPhotoChange} style={{ display: 'none' }} id="coverPhotoInput" />
        </div>
        <div className="profile-picture" onClick={() => document.getElementById('profilePictureInput').click()}>
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" />
          ) : (
            <div className="profile-picture-placeholder">
              <FontAwesomeIcon icon={faCamera} size="3x" />
              <p>Click to add profile picture</p>
            </div>
          )}
          <input type="file" onChange={handleProfilePictureChange} style={{ display: 'none' }} id="profilePictureInput" />
        </div>
        <div className="profile-education-section">
          <div className="section-header">
            <h3>Education</h3>
            <FontAwesomeIcon icon={faPen} onClick={() => setEditMode({ ...editMode, education: !editMode.education })} className="edit-icon" />
          </div>
          {editMode.education && (
            <button onClick={handleAddEducation} className="add-button">Add Education</button>
          )}
          {education.map((edu, index) => (
            <div key={index} className="profile-education-item">
              {editMode.education ? (
                <>
                  <input
                    type="text"
                    placeholder="School"
                    value={edu.school}
                    onChange={(e) =>
                      handleEducationChange(index, "school", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      handleEducationChange(index, "degree", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.field}
                    onChange={(e) =>
                      handleEducationChange(index, "field", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Start Year"
                    value={edu.startYear}
                    onChange={(e) =>
                      handleEducationChange(index, "startYear", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="End Year"
                    value={edu.endYear}
                    onChange={(e) =>
                      handleEducationChange(index, "endYear", e.target.value)
                    }
                  />
                  <FontAwesomeIcon icon={faTrash} onClick={() => handleDeleteEducation(index)} className="delete-icon" />
                </>
              ) : (
                <div>
                  <p>School: {edu.school}</p>
                  <p>Degree: {edu.degree}</p>
                  <p>Field of Study: {edu.field}</p>
                  <p>Start Year: {edu.startYear}</p>
                  <p>End Year: {edu.endYear}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="profile-experience-section">
          <div className="section-header">
            <h3>Experience</h3>
            <FontAwesomeIcon icon={faPen} onClick={() => setEditMode({ ...editMode, experience: !editMode.experience })} className="edit-icon" />
          </div>
          {editMode.experience && (
            <button onClick={handleAddExperience} className="add-button">Add Experience</button>
          )}
          {experience.map((exp, index) => (
            <div key={index} className="profile-experience-item">
              {editMode.experience ? (
                <>
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) =>
                      handleExperienceChange(index, "company", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={exp.title}
                    onChange={(e) =>
                      handleExperienceChange(index, "title", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Start Year"
                    value={exp.startYear}
                    onChange={(e) =>
                      handleExperienceChange(index, "startYear", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="End Year"
                    value={exp.endYear}
                    onChange={(e) =>
                      handleExperienceChange(index, "endYear", e.target.value)
                    }
                  />
                  <FontAwesomeIcon icon={faTrash} onClick={() => handleDeleteExperience(index)} className="delete-icon" />
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
        </div>
        <div className="profile-skills-section">
          <div className="section-header">
            <h3>Skills</h3>
            <FontAwesomeIcon icon={faPen} onClick={() => setEditMode({ ...editMode, skills: !editMode.skills })} className="edit-icon" />
          </div>
          {editMode.skills && (
            <button onClick={handleAddSkill} className="add-button">Add Skill</button>
          )}
          {skills.map((skill, index) => (
            <div key={index} className="profile-skill-item">
              {editMode.skills ? (
                <>
                  <input
                    type="text"
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                  />
                  <FontAwesomeIcon icon={faTrash} onClick={() => handleDeleteSkill(index)} className="delete-icon" />
                </>
              ) : (
                <p>Skill: {skill}</p>
              )}
            </div>
          ))}
        </div>
        <div className="profile-portfolio-link">
          <label>Portfolio Link:</label>
          {editMode.portfolio ? (
            <input
              type="text"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
            />
          ) : (
            <div>
              <p>{portfolioLink}</p>
              <FontAwesomeIcon icon={faPen} onClick={() => setEditMode({ ...editMode, portfolio: !editMode.portfolio })} className="edit-icon" />
            </div>
          )}
        </div>
        <div className="update-profile-button">
          <button onClick={handleUpdateProfile}>Update Profile</button>
        </div>
      </div>
      <div className="col-span-1 lg:col-span-3 profile-page-right"></div>
    </div>
  );
}

export default Profile;