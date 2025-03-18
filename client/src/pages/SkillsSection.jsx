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
    <div className='skills-section bg-white rounded-lg shadow p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold'>Skills</h3>
        {isOwner && (
          <button
            onClick={() => setEditMode(!editMode)}
            className='text-blue-600 hover:text-blue-800'
          >
            <FontAwesomeIcon icon={editMode ? faTimes : faPen} size='lg' />
          </button>
        )}
      </div>
      {skills.map((skill, index) => (
        <div key={index} className='mb-3 flex items-center'>
          {editMode ? (
            <>
              <input
                type='text'
                placeholder='Skill'
                value={skill}
                onChange={e => handleSkillChange(index, e.target.value)}
                className='mt-1 block w-full border border-gray-300 rounded-md p-2'
              />
              <button
                onClick={() => handleDeleteSkill(index)}
                className='ml-3 text-red-500 hover:text-red-600'
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </>
          ) : (
            <p className='text-gray-800'>Skill: {skill}</p>
          )}
        </div>
      ))}
      {editMode && (
        <button
          onClick={handleAddSkill}
          className='mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700'
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
