// Projects.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Dropdown options for filters
  const [projectTypeOptions, setProjectTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [technicalRoleOptions, setTechnicalRoleOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);

  // Filter states
  const [searchFilter, setSearchFilter] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [technicalRoleFilter, setTechnicalRoleFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  // Fetch posts on mount
  useEffect(() => {
    axios
      .get('http://localhost:5200/api/post/all')
      .then(response => {
        // Only keep RECRUITMENT or PROJECT_SEEKING posts
        const projectPosts = response.data.data.filter(
          post =>
            post.postType === 'RECRUITMENT' ||
            post.postType === 'PROJECT_SEEKING'
        );
        setProjects(projectPosts);
        setFilteredProjects(projectPosts);

        // Extract distinct dropdown options
        const typeSet = new Set();
        const locSet = new Set();
        const roleSet = new Set();
        const platSet = new Set();

        projectPosts.forEach(post => {
          if (post.projectType) typeSet.add(post.projectType);
          if (post.location) locSet.add(post.location);
          if (post.technicalRole) roleSet.add(post.technicalRole);
          if (post.platform) platSet.add(post.platform);
        });

        setProjectTypeOptions([...typeSet]);
        setLocationOptions([...locSet]);
        setTechnicalRoleOptions([...roleSet]);
        setPlatformOptions([...platSet]);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  }, []);

  // Handle filters
  const handleFilter = () => {
    const filtered = projects.filter(project => {
      // 1) Search filter (combine projectName + projectDescription)
      let combinedText = '';
      if (project.projectName)
        combinedText += project.projectName.toLowerCase();
      if (project.projectDescription)
        combinedText += ` ${project.projectDescription.toLowerCase()}`;
      const matchesSearch = !searchFilter.trim()
        ? true
        : combinedText.includes(searchFilter.toLowerCase());

      // 2) Post Type filter (exact match)
      const matchesPostType =
        !postTypeFilter || project.postType === postTypeFilter;

      // 3) Project Type filter (exact match)
      const matchesType =
        !projectTypeFilter ||
        (project.projectType &&
          project.projectType.toLowerCase() ===
            projectTypeFilter.toLowerCase());

      // 4) Location filter (exact match)
      const matchesLocation =
        !locationFilter ||
        (project.location &&
          project.location.toLowerCase() === locationFilter.toLowerCase());

      // 5) Technical Role filter (exact match)
      const matchesRole =
        !technicalRoleFilter ||
        (project.technicalRole &&
          project.technicalRole.toLowerCase() ===
            technicalRoleFilter.toLowerCase());

      // 6) Platform filter (exact match)
      const matchesPlatform =
        !platformFilter ||
        (project.platform &&
          project.platform.toLowerCase() === platformFilter.toLowerCase());

      return (
        matchesSearch &&
        matchesPostType &&
        matchesType &&
        matchesLocation &&
        matchesRole &&
        matchesPlatform
      );
    });
    setFilteredProjects(filtered);
  };

  const handleResetFilters = () => {
    setSearchFilter('');
    setPostTypeFilter('');
    setProjectTypeFilter('');
    setLocationFilter('');
    setTechnicalRoleFilter('');
    setPlatformFilter('');
    setFilteredProjects(projects);
  };

  return (
    <div className='w-11/12 mx-auto mt-8'>
      <div className='grid grid-cols-12 gap-6'>
        {/* LEFT COLUMN: Project Feed */}
        <div className='col-span-12 md:col-span-8 space-y-4'>
          {filteredProjects.length === 0 ? (
            <p className='text-gray-500'>
              No projects found. Try adjusting filters.
            </p>
          ) : (
            filteredProjects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Filter Panel */}
        <div className='col-span-12 md:col-span-4 space-y-4'>
          <button
            onClick={() => navigate('/projects/create')}
            className='w-full rounded-md px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors'
            style={{ backgroundColor: '#0046b0' }}
          >
            Create Post
          </button>

          <div className='bg-white rounded-md shadow p-4'>
            <h3 className='text-lg font-bold mb-4'>Filter</h3>

            {/* Search Filter */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Search
              </label>
              <input
                type='text'
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder='Search by name or description'
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            </div>

            {/* Post Type Filter */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Post Type
              </label>
              <select
                value={postTypeFilter}
                onChange={e => setPostTypeFilter(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value=''>All</option>
                <option value='RECRUITMENT'>Recruitment</option>
                <option value='PROJECT_SEEKING'>Project Seeking</option>
              </select>
            </div>

            {/* Project Type Filter */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Project Type
              </label>
              <select
                value={projectTypeFilter}
                onChange={e => setProjectTypeFilter(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value=''>All</option>
                {projectTypeOptions.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Location
              </label>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value=''>All</option>
                {locationOptions.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Technical Role Filter */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Technical Role
              </label>
              <select
                value={technicalRoleFilter}
                onChange={e => setTechnicalRoleFilter(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value=''>All</option>
                {technicalRoleOptions.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Platform
              </label>
              <select
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value=''>All</option>
                {platformOptions.map(plat => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex space-x-2'>
              {/* Apply Filter Button */}
              <button
                onClick={handleFilter}
                className='w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out relative overflow-hidden'
                style={{ backgroundColor: '#0046b0' }}
              >
                {/* Gradient Overlay on Hover */}
                <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 hover:opacity-100 transition-opacity duration-300'></div>
                <span className='relative z-10'>Apply Filter</span>
              </button>

              {/* Reset Filter Button */}
              <button
                onClick={handleResetFilters}
                className='w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out relative overflow-hidden'
                style={{ backgroundColor: '#6b7280' }}
              >
                {/* Gradient Overlay on Hover */}
                <div className='absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-500 opacity-0 hover:opacity-100 transition-opacity duration-300'></div>
                <span className='relative z-10'>Reset Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card component for a single project post.
 */
function ProjectCard({ project }) {
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Navigate to the Apply page with project details.
  const handleRoleClick = () => {
    navigate('/apply', {
      state: {
        role: project.technicalRole,
        requirement: project.requirement,
        projectName: project.projectName,
        projectType: project.projectType,
        startDate: project.startDate,
        endDate: project.endDate,
        location: project.location,
        description: project.projectDescription
      }
    });
  };

  return (
    <div className='bg-white rounded-md shadow overflow-hidden'>
      <div className='flex p-4'>
        {/* Left: Project image (displayed as a circle) */}
        <div className='w-1/5 flex flex-col items-center justify-center space-y-2'>
          {/* Image */}
          {project.user.imageUrl ? (
            <img
              src={project.user.imageUrl}
              alt='Project'
              className='w-16 h-16 rounded-full object-cover'
            />
          ) : (
            <img
              src={fallbackLogo}
              alt='Default Logo'
              className='w-16 h-16 rounded-full'
            />
          )}

          {/* User Info */}
          {project.user && (
            <div className='text-center'>
              {/* First Name and Last Name */}
              <p className='text-sm font-semibold text-gray-700'>
                {project.user.firstName} {project.user.lastName}
              </p>
              {/* Username */}
              <p className='text-xs text-gray-500'>@{project.user.username}</p>
            </div>
          )}
        </div>

        {/* Right: Project details */}
        <div className='w-4/5 pl-4'>
          <h2 className='text-lg font-bold mb-2'>
            {project.projectName || 'Untitled Project'}
          </h2>

          {/* Display platform and post type badge on the same line */}
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm text-gray-600'>
              <strong>Platform:</strong> {project.platform || 'N/A'}
            </p>
            {project.postType === 'RECRUITMENT' && (
              <span className='px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-full'>
                Recruitment
              </span>
            )}
            {project.postType === 'PROJECT_SEEKING' && (
              <span className='px-2 py-1 text-xs font-semibold text-white bg-purple-600 rounded-full'>
                Project Seeking
              </span>
            )}
          </div>

          {/* Basic metadata */}
          <div className='flex flex-wrap text-sm text-gray-600 mb-2'>
            <div className='mr-4'>
              <strong>Project Type:</strong> {project.projectType || 'N/A'}
            </div>
            <div className='mr-4'>
              <strong>Duration:</strong> {project.duration || 'N/A'}
            </div>
            <div className='mr-4'>
              <strong>Location:</strong> {project.location || 'N/A'}
            </div>
          </div>

          {/* Description */}
          <div className='text-sm text-gray-700 mb-2'>
            <strong>Description:</strong>{' '}
            {showFullDescription
              ? project.projectDescription
              : (project.projectDescription || '').substring(0, 100)}
            {project.projectDescription &&
              project.projectDescription.length > 100 && (
                <button
                  onClick={toggleDescription}
                  className='text-blue-500 ml-1 underline text-xs'
                >
                  {showFullDescription ? 'See Less' : 'See More'}
                </button>
              )}
          </div>

          {/* Technical Role Button */}
          {project.technicalRole && (
            <>
              <hr className='my-2' />
              <button
                onClick={handleRoleClick}
                className='bg-blue-600 text-white rounded-md px-4 py-2 text-sm shadow hover:bg-blue-700 transition-colors'
              >
                {project.technicalRole}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    postType: PropTypes.string,
    projectName: PropTypes.string,
    projectDescription: PropTypes.string,
    projectType: PropTypes.string,
    duration: PropTypes.string,
    location: PropTypes.string,
    fileUrl: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    technicalRole: PropTypes.string,
    requirement: PropTypes.string,
    platform: PropTypes.string,
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string,
      avatarUrl: PropTypes.string,
      imageUrl: PropTypes.string
    })
  }).isRequired
};

Projects.propTypes = {
  // Projects are fetched from the backend
};

export default Projects;
