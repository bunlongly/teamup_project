import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';

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
    <div className='personal-info-section p-4 bg-white rounded-lg shadow'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold'>Personal Information</h3>
        {isOwner && (
          <button
            onClick={() => setEditMode(!editMode)}
            className='text-blue-600 hover:text-blue-800 focus:outline-none'
            aria-label={
              editMode ? 'Cancel editing' : 'Edit personal information'
            }
          >
            <FontAwesomeIcon icon={editMode ? faTimes : faPen} size='lg' />
          </button>
        )}
      </div>
      {editMode ? (
        <div className='space-y-4'>
          {/* First and Last Name */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                First Name
              </label>
              <input
                type='text'
                value={personalInfo.firstName || ''}
                onChange={e => handleChange('firstName', e.target.value)}
                className='mt-1 block w-full border border-gray-300 rounded-md p-2'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Last Name
              </label>
              <input
                type='text'
                value={personalInfo.lastName || ''}
                onChange={e => handleChange('lastName', e.target.value)}
                className='mt-1 block w-full border border-gray-300 rounded-md p-2'
              />
            </div>
          </div>
          {/* Username */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Username
            </label>
            <input
              type='text'
              value={personalInfo.username || ''}
              onChange={e => handleChange('username', e.target.value)}
              className='mt-1 block w-full border border-gray-300 rounded-md p-2'
            />
          </div>
          {/* Sensitive Fields: Only visible in edit mode */}
          {isOwner && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Email
                </label>
                <input
                  type='email'
                  value={personalInfo.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Phone Number
                </label>
                <input
                  type='text'
                  value={personalInfo.phoneNumber || ''}
                  onChange={e => handleChange('phoneNumber', e.target.value)}
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Date of Birth
                </label>
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
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Location
                </label>
                <input
                  type='text'
                  value={personalInfo.location || ''}
                  onChange={e => handleChange('location', e.target.value)}
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
            </div>
          )}
          {/* Public Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Job Title
              </label>
              <input
                type='text'
                value={personalInfo.jobTitle || ''}
                onChange={e => handleChange('jobTitle', e.target.value)}
                className='mt-1 block w-full border border-gray-300 rounded-md p-2'
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Bio
            </label>
            <textarea
              value={personalInfo.bio || ''}
              onChange={e => handleChange('bio', e.target.value)}
              className='mt-1 block w-full border border-gray-300 rounded-md p-2'
              rows='3'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Description
            </label>
            <textarea
              value={personalInfo.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              className='mt-1 block w-full border border-gray-300 rounded-md p-2'
              rows='3'
            />
          </div>
        </div>
      ) : (
        <div className='space-y-2'>
          <p className='text-base'>
            <strong>First Name:</strong> {personalInfo.firstName}
          </p>
          <p className='text-base'>
            <strong>Last Name:</strong> {personalInfo.lastName}
          </p>
          <p className='text-base'>
            <strong>Username:</strong> {personalInfo.username}
          </p>
          {/* Sensitive info hidden in read-only mode */}
          <p className='text-base'>
            <strong>Job Title:</strong> {personalInfo.jobTitle}
          </p>
          <p className='text-base'>
            <strong>Bio:</strong> {personalInfo.bio}
          </p>
          <p className='text-base'>
            <strong>Description:</strong> {personalInfo.description}
          </p>
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
