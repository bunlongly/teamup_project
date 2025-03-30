# 🧑‍💻 Technologies Used in the Project

### 🔐 Authentication – Technologies & Tools Used

- **bcryptjs**  
  → Used for hashing passwords during registration and comparing them during login.

- **jsonwebtoken (JWT)**  
  → Used to create and verify tokens for managing authenticated sessions.

- **HTTP-only cookies**  
  → Tokens are stored in secure cookies to protect against client-side access.

- **Prisma ORM**  
  → Used to interact with the database for creating and fetching user records.

- **Environment Variables (.env)**  
  → Securely stores sensitive data like JWT secrets and expiration times.

- **Role-based Logic**  
  → Automatically assigns `ADMIN` role to the first user, and `FREELANCER` to others.

- **Validation Checks**  
  → Confirms password matches during registration and verifies credentials during login.

---

### 🖥️ Frontend Technologies

- **React.js**  
  React is the JavaScript library we use to build the user interface. It allows us to create reusable components for a structured and dynamic front end.

- **Vite**  
  A fast build tool that compiles and runs our React project efficiently during development.

- **Tailwind CSS**  
  A utility-first CSS framework that speeds up styling using predefined classes.

- **Font Awesome**  
  A library used to add icons to the UI for a better visual experience.

- **React Google Charts**  
  Used for displaying data in visual formats like pie charts and task schedules, especially in the task management feature.

- **React Mic**  
  A React component for recording voice. We use this to allow users to send voice messages in group chats.

---

### ⚙️ Backend Technologies

- **Node.js**  
  A JavaScript runtime that allows us to run server-side JavaScript code.

- **Express.js**  
  A backend framework for Node.js, used to build APIs and manage routes.

- **WebSockets**  
  Enables real-time, two-way communication between client and server. Used for live chat features in both individual and group chats.

---

### 🗄️ Database & ORM

- **MySQL**  
  The relational database we use to store structured data like users, posts, messages, etc.

- **MySQL Workbench**  
  A visual tool for managing and interacting with our MySQL database.

- **Prisma**  
  An ORM (Object Relational Mapper) that lets us query and interact with the database using JavaScript instead of raw SQL.

---

### 🌐 Third-Party Services

- **Stripe (Test Mode)**  
  Used to simulate and test payment features like purchasing post limits or other premium services.

- **Cloudinary**  
  A cloud-based service we use to upload and store images. Instead of saving image files, we store URLs returned by Cloudinary.
