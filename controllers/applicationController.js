// applicationController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Endpoint for a user to apply to a project (post)
export const applyToProject = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  const { postId } = req.body; // the project post ID

  try {
    // Check if the user has already applied to this project.
    const existingApplication = await prisma.application.findUnique({
      where: {
        postId_applicantId: {
          postId,
          applicantId: currentUserId
        }
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        error: 'You have already applied to this project.'
      });
    }

    // Create a new application with a default status of PENDING.
    const application = await prisma.application.create({
      data: {
        postId,
        applicantId: currentUserId,
        status: 'PENDING'
      }
    });

    return res.status(201).json({
      data: application,
      message: 'Application submitted and is pending approval.'
    });
  } catch (error) {
    console.error('Error applying to project:', error);
    return res.status(500).json({ error: 'Error applying to project' });
  }
};

// Optional: Endpoint to update application status (e.g., approve or reject)
export const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // Expected to be APPROVED or REJECTED

  try {
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });
    return res.status(200).json({
      data: updatedApplication,
      message: `Application ${status.toLowerCase()}.`
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ error: 'Error updating application status' });
  }
};

export const getApplicationsByPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const applications = await prisma.application.findMany({
      where: { postId },
      include: {
        applicant: true // get user data
      }
    });
    return res.status(200).json({ data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: 'Error fetching applications' });
  }
};

export const getApplicationsForMyProjects = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    // 1) Find all posts by the current user
    const myPosts = await prisma.post.findMany({
      where: { userId: currentUserId },
      select: { id: true, projectName: true } // or include more fields if needed
    });
    const postIds = myPosts.map(p => p.id);

    // 2) Find all applications for those posts
    const applications = await prisma.application.findMany({
      where: { postId: { in: postIds } },
      include: {
        applicant: true,
        post: true // if you want to show project info as well
      }
    });

    return res.status(200).json({ data: applications });
  } catch (error) {
    console.error('Error fetching applications for my projects:', error);
    return res.status(500).json({ error: 'Error fetching applications' });
  }
};

export const getMyApplications = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    const myApplications = await prisma.application.findMany({
      where: {
        applicantId: currentUserId
      },
      include: {
        post: true, // Include the related post/project data
        applicant: true // Ensure the applicant data is included
      }
    });
    return res.status(200).json({ data: myApplications });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    return res.status(500).json({ error: 'Error fetching my applications' });
  }
};
