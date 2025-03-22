import { useState, useEffect } from 'react';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5200/api/post/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data.data);
        // If there are projects, select the first one by default
        if (response.data.data.length > 0) {
          setSelectedProject(response.data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching my projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, [token]);

  if (loading) return <p className='p-4'>Loading your projects...</p>;
  if (!projects.length) return <p className='p-4'>No projects found.</p>;

  return (
    <div className='container mx-auto p-4 flex flex-col md:flex-row gap-6'>
      {/* Left Sidebar: List of Projects */}
      <div className='md:w-1/3 border-r pr-4'>
        <h2 className='text-xl font-bold mb-4'>My Projects</h2>
        <ul className='space-y-2'>
          {projects.map(project => (
            <li
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`cursor-pointer p-2 rounded hover:bg-blue-50 transition-colors ${
                selectedProject?.id === project.id ? 'bg-blue-100' : ''
              }`}
            >
              <div className='flex items-center'>
                <img
                  src={project.fileUrl || fallbackLogo}
                  alt='Project'
                  className='w-10 h-10 rounded-full object-cover mr-2'
                />
                <div>
                  <span className='font-semibold'>
                    {project.projectName || 'Untitled Project'}
                  </span>
                  <p className='text-xs text-gray-600'>
                    Candidates: {project.applications?.length || 0}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Content: Selected Project Details */}
      <div className='md:w-2/3 pl-4'>
        {selectedProject ? (
          <div>
            <h2 className='text-2xl font-bold mb-2'>
              {selectedProject.projectName || 'Untitled Project'}
            </h2>
            <p className='mb-4 text-gray-700'>
              {selectedProject.projectDescription || 'No description provided.'}
            </p>
            <h3 className='text-xl font-semibold mb-2'>Candidates</h3>
            {selectedProject.applications &&
            selectedProject.applications.length > 0 ? (
              <ul className='space-y-4'>
                {selectedProject.applications.map(app => {
                  const { id, status, applicant } = app;
                  const fullName = `${applicant.firstName} ${applicant.lastName}`;
                  return (
                    <li
                      key={id}
                      className='p-4 bg-white rounded shadow flex items-center'
                    >
                      <img
                        src={applicant.imageUrl || fallbackLogo}
                        alt='Candidate'
                        className='w-12 h-12 rounded-full object-cover mr-4 cursor-pointer'
                        onClick={() => navigate(`/profile/${applicant.id}`)}
                      />
                      <div className='flex-1'>
                        <h4 className='font-bold'>{fullName}</h4>
                        <p className='text-sm text-gray-600'>
                          {applicant.jobTitle || 'Web Developer'}
                        </p>
                      </div>
                      <div>
                        {status === 'PENDING' && (
                          <span className='px-3 py-1 bg-blue-500 text-white rounded-full text-xs'>
                            Pending
                          </span>
                        )}
                        {status === 'APPROVED' && (
                          <span className='px-3 py-1 bg-green-600 text-white rounded-full text-xs'>
                            Approved
                          </span>
                        )}
                        {status === 'REJECTED' && (
                          <span className='px-3 py-1 bg-red-600 text-white rounded-full text-xs'>
                            Rejected
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className='text-gray-600'>
                No candidates have applied to this project.
              </p>
            )}
          </div>
        ) : (
          <p>Select a project to view details.</p>
        )}
      </div>
    </div>
  );
}

export default MyProjects;
