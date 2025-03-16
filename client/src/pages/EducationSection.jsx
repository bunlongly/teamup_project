
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

const EducationSection = ({
  education,
  setEducation,
  editMode,
  setEditMode
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
    <div className='education-section'>
      <div className='section-header'>
        <h3>Education</h3>
        <FontAwesomeIcon
          icon={faPen}
          onClick={() => setEditMode(!editMode)}
          className='edit-icon'
        />
      </div>
      {education.map((edu, index) => (
        <div key={index} className='education-item'>
          {editMode ? (
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
      {editMode && <button onClick={handleAddEducation}>Add Education</button>}
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
  setEditMode: PropTypes.func.isRequired
};

export default EducationSection;
