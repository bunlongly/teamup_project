// pages/RecruitmentSuccessPage.jsx
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RecruitmentSuccessPage = () => {
  const navigate = useNavigate();
  // Use a ref to prevent duplicate API calls (if Strict Mode causes the effect to run twice)
  const hasCalledApi = useRef(false);

  useEffect(() => {
    if (hasCalledApi.current) return;

    const recruitmentFormData = localStorage.getItem('recruitmentFormData');
    if (recruitmentFormData) {
      const formData = JSON.parse(recruitmentFormData);
      console.log('Recruitment form data:', formData);

      hasCalledApi.current = true; // Mark as called before making the API call

      axios
        .post('http://localhost:5200/api/post/create', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then(response => {
          toast.success('Post created successfully!');
          // Clear stored data after successful creation
          localStorage.removeItem('recruitmentFormData');
          navigate('/projects');
        })
        .catch(error => {
          toast.error('Error creating post');
          console.error('Error creating post:', error);
        });
    }
  }, [navigate]);

  return (
    <div>
      <h1>Processing your recruitment post...</h1>
    </div>
  );
};

export default RecruitmentSuccessPage;
