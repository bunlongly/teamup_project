import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

const EducationSection = ({
  education,
  setEducation,
  editMode,
  setEditMode,
  isOwner
}) => {
  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { school: '', degree: '', startYear: '', endYear: '' }
    ]);
  };

  const handleDeleteEducation = index => {
    setEducation(education.filter((_, i) => i !== index));
  };

  return (
    <div className='education-section bg-white rounded-lg shadow p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold'>Education</h3>
        {isOwner && (
          <button
            onClick={() => setEditMode(!editMode)}
            className='text-blue-600 hover:text-blue-800'
          >
            <FontAwesomeIcon icon={editMode ? faTimes : faPen} size='lg' />
          </button>
        )}
      </div>
      {education.map((edu, index) => (
        <div
          key={index}
          className='mb-4 border-b pb-4 last:border-none last:pb-0'
        >
          {editMode ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* School */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  School
                </label>
                <input
                  type='text'
                  placeholder='School'
                  value={edu.school}
                  onChange={e =>
                    handleEducationChange(index, 'school', e.target.value)
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
              {/* Degree */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Degree
                </label>
                <input
                  type='text'
                  placeholder='Degree'
                  value={edu.degree}
                  onChange={e =>
                    handleEducationChange(index, 'degree', e.target.value)
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
                  value={edu.startYear}
                  onChange={e =>
                    handleEducationChange(index, 'startYear', e.target.value)
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
                  placeholder='e.g., 2023'
                  value={edu.endYear}
                  onChange={e =>
                    handleEducationChange(index, 'endYear', e.target.value)
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                />
              </div>
            </div>
          ) : (
            <div className='space-y-1'>
              <p className='font-medium text-gray-800'>School: {edu.school}</p>
              <p className='text-sm text-gray-600'>Degree: {edu.degree}</p>
              <p className='text-sm text-gray-600'>
                Start Year: {edu.startYear}
              </p>
              <p className='text-sm text-gray-600'>End Year: {edu.endYear}</p>
            </div>
          )}
          {editMode && (
            <button
              onClick={() => handleDeleteEducation(index)}
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
          onClick={handleAddEducation}
          className='mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700'
        >
          + Add Education
        </button>
      )}
    </div>
  );
};

EducationSection.propTypes = {
  education: PropTypes.arrayOf(
    PropTypes.shape({
      school: PropTypes.string.isRequired,
      degree: PropTypes.string.isRequired,
      startYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      endYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  setEducation: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired
};

export default EducationSection;
