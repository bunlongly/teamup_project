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

      const updateSubscription = async () => {
        try {
          const token = localStorage.getItem('token');
          // If a subscriptionPlan was saved in the formData, call the subscription create-or-update endpoint.
          if (formData.subscriptionPlan) {
            await axios.post(
              'http://localhost:5200/api/subscription/create-or-update',
              { subscriptionPlan: formData.subscriptionPlan },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (error) {
          console.error(
            'Error updating subscription during RecruitmentSuccessPage:',
            error
          );
          // Optionally, you might want to toast an error here.
        }
      };

      const createRecruitmentPost = async () => {
        try {
          const token = localStorage.getItem('token');
          // Ensure the subscription record is created/updated before creating the post.
          await updateSubscription();
          // Now, create the recruitment post.
          const response = await axios.post(
            'http://localhost:5200/api/post/create',
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          toast.success('Post created successfully!');
          // Clear stored data after successful creation.
          localStorage.removeItem('recruitmentFormData');
          navigate('/projects');
        } catch (error) {
          toast.error('Error creating post');
          console.error('Error creating post:', error);
        }
      };

      hasCalledApi.current = true;
      createRecruitmentPost();
    }
  }, [navigate]);

  return (
    <div>
      <h1>Processing your recruitment post...</h1>
    </div>
  );
};

export default RecruitmentSuccessPage;
