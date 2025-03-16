import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

const ExperienceSection = ({
  experience,
  setExperience,
  editMode,
  setEditMode
}) => {
  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: '',
        title: '',
        startYear: '',
        endYear: '',
        employmentType: '',
        description: ''
      }
    ]);
  };

  const handleDeleteExperience = index => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  return (
    <div className='experience-section bg-white rounded-lg shadow p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold'>Experience</h3>
        <button
          onClick={() => setEditMode(!editMode)}
          className='text-blue-600 hover:text-blue-800'
        >
          <FontAwesomeIcon icon={editMode ? faTimes : faPen} size='lg' />
        </button>
      </div>
      {experience.map((exp, index) => (
        <div
          key={index}
          className='mb-4 border-b pb-4 last:border-none last:pb-0'
        >
          {editMode ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Company */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Company
                </label>
                <input
                  type='text'
                  placeholder='Company'
                  value={exp.company}
                  onChange={e =>
                    handleExperienceChange(index, 'company', e.target.value)
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              {/* Title */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Title
                </label>
                <input
                  type='text'
                  placeholder='Title'
                  value={exp.title}
                  onChange={e =>
                    handleExperienceChange(index, 'title', e.target.value)
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              {/* Start Year */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Start Year
                </label>
                <input
                  type='text'
                  placeholder='e.g., 2022'
                  value={exp.startYear}
                  onChange={e =>
                    handleExperienceChange(index, 'startYear', e.target.value)
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              {/* End Year */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  End Year
                </label>
                <input
                  type='text'
                  placeholder='e.g., 2023 or Present'
                  value={exp.endYear}
                  onChange={e =>
                    handleExperienceChange(index, 'endYear', e.target.value)
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              {/* Employment Type */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Employment Type
                </label>
                <select
                  value={exp.employmentType}
                  onChange={e =>
                    handleExperienceChange(
                      index,
                      'employmentType',
                      e.target.value
                    )
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                >
                  <option value=''>Select Employment Type</option>
                  <option value='Full-time'>Full-time</option>
                  <option value='Part-time'>Part-time</option>
                  <option value='Contract'>Contract</option>
                  <option value='Freelance'>Freelance</option>
                  <option value='Internship'>Internship</option>
                  <option value='Temporary'>Temporary</option>
                </select>
              </div>
              {/* Description */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Description
                </label>
                <textarea
                  placeholder='Brief description of the role'
                  value={exp.description}
                  onChange={e =>
                    handleExperienceChange(index, 'description', e.target.value)
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                  rows='3'
                />
              </div>
            </div>
          ) : (
            <div className='space-y-1'>
              <p className='font-medium text-gray-800'>
                {exp.title} at {exp.company}
              </p>
              <p className='text-sm text-gray-600'>
                {exp.startYear} - {exp.endYear}
                {exp.employmentType && ` | ${exp.employmentType}`}
              </p>
              {exp.description && (
                <p className='text-sm text-gray-600'>{exp.description}</p>
              )}
            </div>
          )}
          {editMode && (
            <button
              onClick={() => handleDeleteExperience(index)}
              className='mt-2 inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded shadow hover:bg-red-600'
            >
              <FontAwesomeIcon icon={faTrash} className='mr-2' />
              Delete
            </button>
          )}
        </div>
      ))}
      {editMode && (
        <button
          onClick={handleAddExperience}
          className='mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700'
        >
          + Add Experience
        </button>
      )}
    </div>
  );
};

ExperienceSection.propTypes = {
  experience: PropTypes.arrayOf(
    PropTypes.shape({
      company: PropTypes.string,
      title: PropTypes.string,
      startYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      endYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      employmentType: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired,
  setExperience: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired
};

export default ExperienceSection;
