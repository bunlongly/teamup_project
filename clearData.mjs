// clearData.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log("Clearing Comments...");
    await prisma.comment.deleteMany({});

    console.log("Clearing Likes...");
    await prisma.like.deleteMany({});

    console.log("Clearing Applications...");
    await prisma.application.deleteMany({});

    console.log("Clearing Submissions...");
    await prisma.submission.deleteMany({});

    console.log("Clearing Tasks...");
    await prisma.task.deleteMany({});

    console.log("Clearing ChatCustomizations...");
    await prisma.chatCustomization.deleteMany({});

    console.log("Clearing ChatParticipants...");
    await prisma.chatParticipant.deleteMany({});

    console.log("Clearing Messages...");
    await prisma.message.deleteMany({});

    console.log("Clearing Chats...");
    await prisma.chat.deleteMany({});

    console.log("Clearing Notifications...");
    await prisma.notification.deleteMany({});

    console.log("Clearing Connections...");
    await prisma.connection.deleteMany({});

    console.log("Clearing UserSkills...");
    await prisma.userSkill.deleteMany({});

    console.log("Clearing Education...");
    await prisma.education.deleteMany({});

    console.log("Clearing Experience...");
    await prisma.experience.deleteMany({});

    console.log("Clearing Subscriptions...");
    await prisma.subscription.deleteMany({});

    console.log("Clearing Posts...");
    await prisma.post.deleteMany({});

    console.log("Clearing Skills...");
    await prisma.skill.deleteMany({});

    console.log("Clearing Users...");
    await prisma.user.deleteMany({});

    console.log("All data cleared successfully!");
  } catch (error) {
    console.error("Error clearing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
