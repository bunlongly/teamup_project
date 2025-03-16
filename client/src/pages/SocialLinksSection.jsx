// SocialLinksSection.jsx
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {
  faGithub,
  faTwitter,
  faYoutube,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const SocialLinksSection = ({
  socialLinks,
  setSocialLinks,
  editMode,
  setEditMode
}) => {
  const handleChange = (field, value) => {
    setSocialLinks({ ...socialLinks, [field]: value });
  };

  const handleDelete = field => {
    setSocialLinks({ ...socialLinks, [field]: '' });
  };

  // Social links configuration: field, label, placeholder, and corresponding icon
  const linksConfig = [
    {
      field: 'github',
      label: 'GitHub',
      placeholder: 'https://github.com/username',
      icon: faGithub
    },
    {
      field: 'twitter',
      label: 'Twitter',
      placeholder: 'https://twitter.com/username',
      icon: faTwitter
    },
    {
      field: 'youtube',
      label: 'YouTube',
      placeholder: 'https://youtube.com/channel/yourchannel',
      icon: faYoutube
    },
    {
      field: 'facebook',
      label: 'Facebook',
      placeholder: 'https://facebook.com/username',
      icon: faFacebook
    },
    {
      field: 'instagram',
      label: 'Instagram',
      placeholder: 'https://instagram.com/username',
      icon: faInstagram
    },
    {
      field: 'portfolio',
      label: 'Portfolio',
      placeholder: 'https://yourportfolio.com',
      icon: faGlobe
    }
  ];

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='text-lg font-semibold'>Social Links &amp; Portfolio</h3>
        <button
          onClick={() => setEditMode(!editMode)}
          className='text-blue-600 hover:text-blue-800 focus:outline-none'
          aria-label={
            editMode ? 'Cancel editing social links' : 'Edit social links'
          }
        >
          <FontAwesomeIcon icon={editMode ? faTimes : faPen} size='lg' />
        </button>
      </div>

      {/* EDIT MODE */}
      {editMode ? (
        <div className='space-y-3'>
          {linksConfig.map(({ field, label, placeholder, icon }) => (
            <div key={field} className='flex items-center space-x-2'>
              <FontAwesomeIcon icon={icon} className='text-gray-600' />
              <input
                type='url'
                value={socialLinks[field] || ''}
                onChange={e => handleChange(field, e.target.value)}
                className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                placeholder={placeholder}
              />
              {socialLinks[field] && (
                <button
                  onClick={() => handleDelete(field)}
                  className='text-red-500 hover:text-red-700 focus:outline-none'
                  aria-label={`Clear ${label} link`}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        // READ-ONLY MODE
        <div className='space-y-2'>
          {linksConfig.map(({ field, label, icon }) =>
            socialLinks[field] ? (
              <div
                key={field}
                className='flex flex-wrap items-center space-x-2'
              >
                <FontAwesomeIcon icon={icon} className='text-gray-600' />
                <span className='font-medium'>{label}:</span>
                <a
                  href={socialLinks[field]}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:underline break-all'
                >
                  {socialLinks[field]}
                </a>
              </div>
            ) : null
          )}
          {/* If no links are provided, show a placeholder */}
          {linksConfig.every(({ field }) => !socialLinks[field]) && (
            <p className='text-gray-500'>No social links added.</p>
          )}
        </div>
      )}
    </div>
  );
};

SocialLinksSection.propTypes = {
  socialLinks: PropTypes.shape({
    github: PropTypes.string,
    twitter: PropTypes.string,
    youtube: PropTypes.string,
    facebook: PropTypes.string,
    instagram: PropTypes.string,
    portfolio: PropTypes.string
  }).isRequired,
  setSocialLinks: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired
};

export default SocialLinksSection;
