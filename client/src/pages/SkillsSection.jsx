import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

const SkillsSection = ({
  skills,
  setSkills,
  editMode,
  setEditMode,
  isOwner
}) => {
  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleAddSkill = () => {
    setSkills([...skills, '']);
  };

  const handleDeleteSkill = index => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className='skills-section bg-white rounded-lg shadow-md p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-5 border-b pb-3'>
        <h3 className='text-2xl font-semibold text-gray-800'>Skills</h3>
        {isOwner && (
          <button
            onClick={() => setEditMode(!editMode)}
            className='text-blue-600 hover:text-blue-800 transition-colors duration-200'
            aria-label={editMode ? 'Cancel edit' : 'Edit skills'}
          >
            <FontAwesomeIcon icon={editMode ? faTimes : faPen} size='lg' />
          </button>
        )}
      </div>

      {/* Skills Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {skills.map((skill, index) => (
          <div
            key={index}
            className='flex items-center justify-between p-3 border border-gray-200 rounded'
          >
            {editMode ? (
              <>
                <input
                  type='text'
                  placeholder='Enter skill'
                  value={skill}
                  onChange={e => handleSkillChange(index, e.target.value)}
                  className='w-full mr-3 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <button
                  onClick={() => handleDeleteSkill(index)}
                  className='text-red-500 hover:text-red-600 transition-colors duration-200'
                  aria-label='Delete skill'
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            ) : (
              <span className='text-gray-700 text-base'>{skill}</span>
            )}
          </div>
        ))}
      </div>

      {/* Add Skill Button */}
      {editMode && (
        <button
          onClick={handleAddSkill}
          className='mt-4 inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 transition-colors duration-200'
        >
          + Add Skill
        </button>
      )}
    </div>
  );
};

SkillsSection.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSkills: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired
};

export default SkillsSection;
