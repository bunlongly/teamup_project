// import React from 'react';
import PropTypes from 'prop-types';
import fallbackLogo from '../assets/logo.png';

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function ProjectHeader({ project, ownerName }) {
  return (
    <>
      {/* Project Info (Header) */}
      <div className='bg-white rounded-md shadow p-6 mb-6'>
        <div className='flex items-center mb-4'>
          <img
            src={project.user?.imageUrl || fallbackLogo}
            alt='Project'
            className='w-16 h-16 object-contain rounded mr-4'
          />
          <div>
            <h1 className='text-2xl font-bold'>
              {project.user?.jobTitle || 'No job title'}
            </h1>
            <p className='text-sm text-gray-600'>
              @{project.user?.username || 'username'}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-4'>
          <div>
            <span className='font-semibold'>Owner:</span> {ownerName}
          </div>
          <div>
            <span className='font-semibold'>Platform:</span>{' '}
            {project.platform || 'N/A'}
          </div>
          <div>
            <span className='font-semibold'>Technical Role:</span>{' '}
            {project.technicalRole || 'N/A'}
          </div>
          <div>
            <span className='font-semibold'>Duration:</span>{' '}
            {project.duration || 'N/A'}
          </div>
          <div>
            <span className='font-semibold'>Start Date:</span>{' '}
            {formatDate(project.startDate)}
          </div>
          <div>
            <span className='font-semibold'>End Date:</span>{' '}
            {formatDate(project.endDate)}
          </div>
        </div>
        <p className='text-gray-700'>
          {project.projectDescription || 'No description provided.'}
        </p>
      </div>

      {/* Additional Project Overview Panel */}
      <div className='bg-white rounded-md shadow p-6 mb-6 flex flex-col sm:flex-row items-center'>
        <div className='w-full sm:w-1/3 mb-4 sm:mb-0'>
          <img
            src={project.fileUrl || fallbackLogo}
            alt='Project Overview'
            className='w-full h-auto object-cover rounded'
          />
        </div>
        <div className='w-full sm:w-2/3 sm:pl-6'>
          <h2 className='text-2xl font-bold mb-2'>
            {project.projectName || 'Untitled Project'}
          </h2>
          <p className='text-gray-700 mb-2'>
            {project.projectDescription || 'No description provided.'}
          </p>
        </div>
      </div>
    </>
  );
}

ProjectHeader.propTypes = {
  project: PropTypes.object.isRequired,
  ownerName: PropTypes.string.isRequired
};

export default ProjectHeader;
