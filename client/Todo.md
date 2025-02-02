# Frontend Technology Stack: React.Js and Tailwind CSS
# Frontend Development Steps 

## Step 1: Authentication

### Login Page
- Create a login form 

### Register Page
- Create a registration form 

---

## Step 2: Navbar

### Navigation Bar
- Create a responsive navbar with links to:
  - Home
  - Network
  - Projects
  - My Projects
  - Notification
  - Candidate
  - Profile
  - Logout
- Include a **logout** button for authenticated users.
- Highlight the active page link for better user experience.

---

## Step 3: Profile Page

### User Profile Page
- Display user details:
  - Name
  - Email
  - Skills
  - Education
  - Experience
  - etc
- Add a "Follow" button for other users to follow the profile.

### Edit Profile Page
- Create a form to allow users to update their profile information.
- Include fields for:
  - Name
  - Email
  - Skills (add/remove)
  - Education (add/remove)
  - Experience (add/remove)
  - etc
- Add a "Save Changes" button to submit the form.

---

## Step 4: Project Pages

### Create Project Page
- Create a form for users to post new projects.
- Include fields for:
  - Project Title
  - Description
  - Required Skills
  - Deadline
  - etc
- Add a "Create Project" button to submit the form.

### Edit Project Page
- Allow project owners to update project details.
- Use the same form as the "Create Project Page" but pre-fill it with existing data.
- Add a "Save Changes" button to submit the form.

### View Project Details Page
- Display detailed information about a project:
  - Title
  - Description
  - Required Skills
  - Deadline
  - Team Members
  - etc



## Backend Technology Stack

### Core Technologies:
- **Node.js**: Runtime environment for server-side JavaScript.
- **Express.js**: Web framework for building RESTful APIs.
- **Sequelize**: ORM (Object-Relational Mapping) for MySQL.
- **MySQL**: Relational database for storing application data.
- **MinIO**: Object storage for handling file uploads (e.g., profile pictures, project attachments).

## Backend Development Steps

## Phase 1: Core User System & Authentication (High Priority)

### Tables to Implement First:

- **User**: Essential for user registration, authentication, and profile management.
- **Followers**: Enables users to build their network by following other users.
- **Skill**: Allows users to list their skills.
- **UserSkill**: Associates skills with user profiles.
- **Education** :user profiles with educational background.
- **Experience**:user profiles with professional experience.


## Phase 2: Recruitment System & Team Formation (High Priority)

### Tables to Implement Next:

- **Project**: Allows users to create projects and recruit teammates.
- **Request**: Enables users to apply for projects.
- **Request Management**: Tracks the status of project applications (approvals/rejections).
- **Team**: Groups users into teams once they are recruited.
- **Team Member**: Tracks which users belong to which team.


## Phase 3: Project Management System (Medium-High Priority)

### Tables to Implement Next:

- **Task**: Allows users to create tasks for projects.
- **Team Task**: Assigns tasks to specific team members.
- **Team Role Member**: Defines roles and responsibilities within a team.

## Phase 4: Messaging & Notifications (Medium Priority)

### Tables to Implement Next:

- **Chat**: Facilitates team communication.
- **Message**: Stores chat messages for communication history.
- **Notification**: Sends system updates, task assignments, approvals, and other notifications.


