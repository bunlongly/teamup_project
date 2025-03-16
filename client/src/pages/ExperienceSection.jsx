
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

const ExperienceSection = ({ experience, setExperience, editMode, setEditMode }) => {
  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const handleAddExperience = () => {
    setExperience([...experience, { company: '', title: '', startYear: '', endYear: '' }]);
  };

  const handleDeleteExperience = index => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  return (
    <div className="experience-section">
      <div className="section-header">
        <h3>Experience</h3>
        <FontAwesomeIcon
          icon={faPen}
          onClick={() => setEditMode(!editMode)}
          className="edit-icon"
        />
      </div>
      {experience.map((exp, index) => (
        <div key={index} className="experience-item">
          {editMode ? (
            <>
              <input
                type="text"
                placeholder="Company"
                value={exp.company}
                onChange={e => handleExperienceChange(index, 'company', e.target.value)}
              />
              <input
                type="text"
                placeholder="Title"
                value={exp.title}
                onChange={e => handleExperienceChange(index, 'title', e.target.value)}
              />
              <input
                type="text"
                placeholder="Start Year"
                value={exp.startYear}
                onChange={e => handleExperienceChange(index, 'startYear', e.target.value)}
              />
              <input
                type="text"
                placeholder="End Year"
                value={exp.endYear}
                onChange={e => handleExperienceChange(index, 'endYear', e.target.value)}
              />
              <FontAwesomeIcon
                icon={faTrash}
                onClick={() => handleDeleteExperience(index)}
                className="delete-icon"
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
      {editMode && <button onClick={handleAddExperience}>Add Experience</button>}
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
    })
  ).isRequired,
  setExperience: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
};

export default ExperienceSection;
