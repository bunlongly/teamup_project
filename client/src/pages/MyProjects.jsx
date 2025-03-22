import  { useState, useEffect } from 'react';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function MyProjects() {
  // "My Projects" shows projects you own;
  // "Enrolled Projects" shows projects where your application is approved.
  const [activeTab, setActiveTab] = useState('My Projects');
  const [myProjects, setMyProjects] = useState([]); 
  const [enrolledProjects, setEnrolledProjects] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch owner's projects from /api/post/my.
  const fetchMyProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5200/api/post/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching my projects:', error);
    }
  };

  // Fetch candidate applications from /api/application/my and filter for approved ones.
  const fetchEnrolledProjects = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5200/api/application/my',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Filter to only approved applications.
      const approvedApps = response.data.data.filter(
        app => app.status === 'APPROVED'
      );
      // Group by postId in case multiple approved applications exist for the same project.
      const grouped = approvedApps.reduce((acc, app) => {
        const { postId } = app;
        if (!acc[postId]) {
          acc[postId] = { ...app.post, count: 0 };
        }
        acc[postId].count += 1;
        return acc;
      }, {});
      setEnrolledProjects(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching enrolled projects:', error);
    }
  };

  // Fetch data when the active tab changes.
  useEffect(() => {
    setLoading(true);
    if (activeTab === 'My Projects') {
      fetchMyProjects().finally(() => setLoading(false));
    } else {
      fetchEnrolledProjects().finally(() => setLoading(false));
    }
  }, [activeTab, token]);

  // Filter the projects based on filterText.
  const filteredMyProjects = myProjects.filter(project => {
    const name = project.projectName || '';
    const desc = project.projectDescription || '';
    return (
      name.toLowerCase().includes(filterText.toLowerCase()) ||
      desc.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const filteredEnrolledProjects = enrolledProjects.filter(project => {
    const name = project.projectName || '';
    const desc = project.projectDescription || '';
    return (
      name.toLowerCase().includes(filterText.toLowerCase()) ||
      desc.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  if (loading) return <p className='p-4'>Loading...</p>;

  return (
    <div className='container mx-auto p-4'>
      {/* Tabs for switching views */}
      <div className='mb-4 border-b'>
        <ul className='flex space-x-6'>
          {['My Projects', 'Enrolled Projects'].map(tab => (
            <li
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setFilterText('');
              }}
              className={`cursor-pointer pb-2 transition-all duration-300 ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 font-semibold text-gray-800'
                  : 'text-gray-500 hover:border-b-2 hover:border-blue-300'
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content with Filter Panel */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Column: Projects Grid */}
        <div className='lg:col-span-8'>
          {activeTab === 'My Projects' ? (
            filteredMyProjects.length === 0 ? (
              <p className='p-4'>No projects match your filter.</p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {filteredMyProjects.map(project => (
                  <div
                    key={project.id}
                    className='bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
                    onClick={() => navigate(`/projects/detail/${project.id}`)}
                  >
                    <img
                      src={project.fileUrl || fallbackLogo}
                      alt='Project'
                      className='w-full h-32 sm:h-40 object-contain rounded mb-4'
                    />
                    <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-1'>
                      {project.projectName || 'Untitled Project'}
                    </h3>
                    <p className='text-sm text-gray-600 mb-2'>
                      {project.projectDescription
                        ? project.projectDescription.substring(0, 100) + '...'
                        : 'No description provided.'}
                    </p>
                    <p className='text-sm text-gray-600'>
                      Approved Candidates:{' '}
                      {project.applications?.filter(
                        app => app.status === 'APPROVED'
                      ).length || 0}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : filteredEnrolledProjects.length === 0 ? (
            <p className='p-4'>No enrolled projects match your filter.</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {filteredEnrolledProjects.map(project => (
                <div
                  key={project.id}
                  className='bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-4 sm:p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
                >
                  <img
                    src={project.fileUrl || fallbackLogo}
                    alt='Project'
                    className='w-full h-32 sm:h-40 object-contain rounded mb-4'
                  />
                  <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-1'>
                    {project.projectName || 'Untitled Project'}
                  </h3>
                  <p className='text-sm text-gray-600 mb-2'>
                    {project.projectDescription
                      ? project.projectDescription.substring(0, 100) + '...'
                      : 'No description provided.'}
                  </p>
                  <p className='text-sm text-green-600 font-semibold'>
                    Approved ({project.count})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Filter Panel */}
        <div className='lg:col-span-4'>
          <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-4'>
              Filter Projects
            </h2>
            <label className='block text-sm font-medium text-gray-700'>
              Search by Name or Description
            </label>
            <input
              type='text'
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder='Enter search text'
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
            <button
              onClick={() => setFilterText('')}
              className='mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProjects;
