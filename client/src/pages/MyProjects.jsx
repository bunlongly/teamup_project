import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function MyProjects() {
  // "My Projects" shows projects you own;
  // "Enrolled Projects" shows projects where your application is approved.
  const [activeTab, setActiveTab] = useState('My Projects');
  const [myProjects, setMyProjects] = useState([]); // Owner view
  const [enrolledProjects, setEnrolledProjects] = useState([]); // Candidate view (approved applications)
  const [loading, setLoading] = useState(true);
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

  if (loading) return <p className='p-4'>Loading...</p>;

  return (
    <div className='container mx-auto p-4'>
      {/* Tabs for switching views */}
      <div className='mb-4 border-b'>
        <ul className='flex space-x-6'>
          {['My Projects', 'Enrolled Projects'].map(tab => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
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

      {activeTab === 'My Projects' ? (
        // Owner View: List projects in a grid.
        myProjects.length === 0 ? (
          <p className='p-4'>You haven't created any projects yet.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {myProjects.map(project => (
              <div
                key={project.id}
                className='bg-white rounded-md shadow-lg p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
                onClick={() => navigate(`/projects/detail/${project.id}`)}
              >
                <img
                  src={project.fileUrl || fallbackLogo}
                  alt='Project'
                  className='w-full h-40 object-cover rounded mb-4'
                />
                <h3 className='text-lg font-bold text-gray-800'>
                  {project.projectName || 'Untitled Project'}
                </h3>
                <p className='text-sm text-gray-600'>
                  {project.projectDescription
                    ? project.projectDescription.substring(0, 100) + '...'
                    : 'No description provided.'}
                </p>
                <p className='mt-2 text-sm text-gray-600'>
                  Approved Candidates:{' '}
                  {project.applications?.filter(
                    app => app.status === 'APPROVED'
                  ).length || 0}
                </p>
              </div>
            ))}
          </div>
        )
      ) : // Candidate View: List enrolled projects (approved applications) in a grid.
      enrolledProjects.length === 0 ? (
        <p className='p-4'>You have no enrolled projects yet.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {enrolledProjects.map(project => (
            <div
              key={project.id}
              className='bg-white rounded-md shadow-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
            >
              <img
                src={project.fileUrl || fallbackLogo}
                alt='Project'
                className='w-full h-40 object-cover rounded mb-4'
              />
              <h3 className='text-lg font-bold text-gray-800'>
                {project.projectName || 'Untitled Project'}
              </h3>
              <p className='text-sm text-gray-600'>
                {project.projectDescription
                  ? project.projectDescription.substring(0, 100) + '...'
                  : 'No description provided.'}
              </p>
              <p className='mt-2 text-sm text-green-600 font-semibold'>
                Approved ({project.count})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProjects;
