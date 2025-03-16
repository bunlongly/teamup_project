import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

const SkillsSection = ({ skills, setSkills, editMode, setEditMode }) => {
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
    <div className='skills-section'>
      <div className='section-header'>
        <h3>Skills</h3>
        <FontAwesomeIcon
          icon={faPen}
          onClick={() => setEditMode(!editMode)}
          className='edit-icon'
        />
      </div>
      {skills.map((skill, index) => (
        <div key={index} className='skill-item'>
          {editMode ? (
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
      {editMode && <button onClick={handleAddSkill}>Add Skill</button>}
    </div>
  );
};

SkillsSection.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSkills: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired
};

export default SkillsSection;
