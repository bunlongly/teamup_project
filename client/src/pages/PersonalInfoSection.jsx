import PropTypes from 'prop-types';

const PersonalInfoSection = ({
  personalInfo,
  setPersonalInfo,
  editMode,
  setEditMode,
  isOwner
}) => {
  const handleChange = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  return (
    <div className='personal-info-section'>
      <div className='section-header'>
        <h3>Personal Information</h3>
        {isOwner && (
          <button onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>
      {editMode ? (
        <div className='personal-info-form'>
          <label>First Name</label>
          <input
            type='text'
            value={personalInfo.firstName || ''}
            onChange={e => handleChange('firstName', e.target.value)}
          />
          <label>Last Name</label>
          <input
            type='text'
            value={personalInfo.lastName || ''}
            onChange={e => handleChange('lastName', e.target.value)}
          />
          {/* Sensitive fields: only show in edit mode */}
          {isOwner && (
            <>
              <label>Email</label>
              <input
                type='email'
                value={personalInfo.email || ''}
                onChange={e => handleChange('email', e.target.value)}
              />
              <label>Phone Number</label>
              <input
                type='text'
                value={personalInfo.phoneNumber || ''}
                onChange={e => handleChange('phoneNumber', e.target.value)}
              />
              <label>Date of Birth</label>
              <input
                type='date'
                value={
                  personalInfo.dateOfBirth
                    ? new Date(personalInfo.dateOfBirth)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={e => handleChange('dateOfBirth', e.target.value)}
              />
              <label>Location</label>
              <input
                type='text'
                value={personalInfo.location || ''}
                onChange={e => handleChange('location', e.target.value)}
              />
            </>
          )}
          <label>Job Title</label>
          <input
            type='text'
            value={personalInfo.jobTitle || ''}
            onChange={e => handleChange('jobTitle', e.target.value)}
          />
          <label>Bio</label>
          <textarea
            value={personalInfo.bio || ''}
            onChange={e => handleChange('bio', e.target.value)}
          />
          <label>Description</label>
          <textarea
            value={personalInfo.description || ''}
            onChange={e => handleChange('description', e.target.value)}
          />
        </div>
      ) : (
        <div className='personal-info-display'>
          <p>First Name: {personalInfo.firstName}</p>
          <p>Last Name: {personalInfo.lastName}</p>
          {/* Do not show sensitive info when not editing */}
          <p>Job Title: {personalInfo.jobTitle}</p>
          <p>Bio: {personalInfo.bio}</p>
          <p>Description: {personalInfo.description}</p>
        </div>
      )}
    </div>
  );
};

PersonalInfoSection.propTypes = {
  personalInfo: PropTypes.object.isRequired,
  setPersonalInfo: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired
};

export default PersonalInfoSection;
