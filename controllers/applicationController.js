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

    // Fetch the post to get the project owner's ID.
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (post) {
      // Create a notification for the project owner.
      await prisma.notification.create({
        data: {
          recipientId: post.userId,
          senderId: currentUserId,
          type: 'application_request',
          message: 'A candidate has applied to your project.'
        }
      });
    }

    // Also, create a notification for the candidate confirming their application.
    await prisma.notification.create({
      data: {
        recipientId: currentUserId,
        senderId: post ? post.userId : null, // If available, set the project owner as sender
        type: 'application_submitted',
        message: 'You have applied to the project.'
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

// Endpoint to update application status (e.g., approve or reject)
export const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // Expected to be APPROVED or REJECTED

  try {
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    // Fetch the application to get candidate and post details.
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { applicantId: true, postId: true }
    });

    // Fetch the post to get the owner id.
    const post = await prisma.post.findUnique({
      where: { id: application.postId },
      select: { userId: true }
    });

    // Determine notification messages.
    let candidateMessage = '';
    let ownerMessage = '';

    if (status === 'APPROVED') {
      candidateMessage = 'Your application has been approved.';
      ownerMessage = 'You have approved a candidate.';
    } else if (status === 'REJECTED') {
      candidateMessage = 'Your application has been rejected.';
      ownerMessage = 'You have rejected a candidate.';
    }

    // Create a notification for the candidate.
    if (candidateMessage) {
      await prisma.notification.create({
        data: {
          recipientId: application.applicantId,
          senderId: post.userId, // The owner of the project
          type: 'application_status_update',
          message: candidateMessage
        }
      });
    }

    // Create a notification for the owner.
    if (ownerMessage) {
      await prisma.notification.create({
        data: {
          recipientId: post.userId,
          senderId: application.applicantId,
          type: 'application_processed',
          message: ownerMessage
        }
      });
    }

    return res.status(200).json({
      data: updatedApplication,
      message: `Application ${status.toLowerCase()}.`
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ error: 'Error updating application status' });
  }
};

// Endpoint to get applications for a specific post
export const getApplicationsByPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const applications = await prisma.application.findMany({
      where: { postId },
      include: {
        applicant: true
      }
    });
    return res.status(200).json({ data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: 'Error fetching applications' });
  }
};

// Endpoint to get applications for projects owned by the current user
export const getApplicationsForMyProjects = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    // Find posts owned by the current user.
    const myPosts = await prisma.post.findMany({
      where: { userId: currentUserId },
      select: { id: true, projectName: true }
    });
    const postIds = myPosts.map(p => p.id);

    // Find applications for those posts.
    const applications = await prisma.application.findMany({
      where: { postId: { in: postIds } },
      include: {
        applicant: true,
        post: true
      }
    });

    return res.status(200).json({ data: applications });
  } catch (error) {
    console.error('Error fetching applications for my projects:', error);
    return res.status(500).json({ error: 'Error fetching applications' });
  }
};

// Endpoint to get the current candidate's applications.
export const getMyApplications = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    const myApplications = await prisma.application.findMany({
      where: { applicantId: currentUserId },
      include: {
        post: true,
        applicant: true
      }
    });
    return res.status(200).json({ data: myApplications });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    return res.status(500).json({ error: 'Error fetching my applications' });
  }
};
