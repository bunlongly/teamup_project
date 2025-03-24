import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MyProjectHeader from '../components/MyProjectHeader';
import MyProjectTabs from '../components/MyProjectTabs';

function MyProjectDetailPage() {
  const { id } = useParams(); // project ID from URL
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for tabs and tasks/team members (tasks may come from project.tasks)
  const [activeTab, setActiveTab] = useState('Task');
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('Pending');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const proj = response.data.data;
        console.log('Fetched project:', proj);
        setProject(proj);

        // Set tasks if available
        if (proj.tasks) {
          setTasks(proj.tasks);
          console.log('Fetched tasks:', proj.tasks);
        } else {
          console.log('No tasks found in project.');
        }

        // Extract approved team members from applications
        if (proj.applications) {
          const approvedMembers = proj.applications
            .filter(app => app.status === 'APPROVED' && app.applicant)
            .map(app => app.applicant);
          console.log('Approved team members:', approvedMembers);
          setTeamMembers(approvedMembers);
        } else {
          console.log('No applications found in project.');
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  const ownerName = project?.user
    ? `${project.user.firstName} ${project.user.lastName}`
    : 'Unknown Owner';

  if (loading) return <p className='p-4'>Loading project details...</p>;
  if (!project) return <p className='p-4'>Project not found.</p>;

  return (
    <div className='container mx-auto p-4'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>

      {/* Project Header */}
      <MyProjectHeader project={project} ownerName={ownerName} />

      {/* Tabs Section */}
      <MyProjectTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasks={tasks}
        teamMembers={teamMembers}
        newTaskName={newTaskName}
        setNewTaskName={setNewTaskName}
        newTaskDueDate={newTaskDueDate}
        setNewTaskDueDate={setNewTaskDueDate}
        newTaskDescription={newTaskDescription}
        setNewTaskDescription={setNewTaskDescription}
        newTaskAssignedTo={newTaskAssignedTo}
        setNewTaskAssignedTo={setNewTaskAssignedTo}
        newTaskStatus={newTaskStatus}
        setNewTaskStatus={setNewTaskStatus}
        handleAddTask={() => {
          if (
            !newTaskName ||
            !newTaskDueDate ||
            !newTaskAssignedTo ||
            !newTaskDescription
          ) {
            alert('Please fill in all fields');
            return;
          }
          const newTask = {
            id: Date.now(), // For demo purposes; in real app use backend-generated ID.
            name: newTaskName,
            dueDate: newTaskDueDate,
            description: newTaskDescription,
            attachment: null,
            status: newTaskStatus,
            assignedTo: newTaskAssignedTo
          };
          setTasks(prev => [...prev, newTask]);
          // Clear form fields.
          setNewTaskName('');
          setNewTaskDueDate('');
          setNewTaskDescription('');
          setNewTaskAssignedTo('');
          setNewTaskStatus('Pending');
        }}
        project={project}
        ownerName={ownerName}
      />
    </div>
  );
}

export default MyProjectDetailPage;
