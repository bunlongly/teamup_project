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
