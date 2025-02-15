📌 Step 4: Install Dependencies

npm install express mysql2 sequelize dotenv http-status-codes bcryptjs jsonwebtoken cookie-parser cors express-rate-limit

Dependencies Explained:
express → Web framework for building APIs
mysql2 → MySQL driver for Node.js
sequelize → ORM for MySQL
dotenv → Loads environment variables
http-status-codes → Standard HTTP response codes
bcryptjs → Hashes passwords securely
jsonwebtoken → Generates & verifies JWT tokens
cookie-parser → Parses cookies in requests
cors → Handles Cross-Origin Resource Sharing
express-rate-limit → Limits repeated requests


📌 Step 5: Create the Folder Structure
mkdir config controllers models middleware routes utils errors
touch server.js config/db.js .env routes/authRoutes.js models/UserModel.js controllers/authController.js middleware/validationMiddleware.js utils/tokenUtils.js utils/passwordUtils.js errors/customError.js


📌 Step 6: Setup .env for Environment Variables
Open .env and add your database credentials:

ini
Copy
Edit
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=teamup_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
NODE_ENV=development


📌 Step 7: Setup Database Connection (config/db.js)
Edit config/db.js and set up Sequelize:

javascript
Copy
Edit
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Set to true for debugging
  }
);

export default sequelize;

📌 Step 8: Setup User Model (models/UserModel.js)
Edit models/UserModel.js:

javascript
Copy
Edit
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "user"),
    defaultValue: "user",
  },
});

export default User;


📌 Step 9: Setup Authentication Controller (controllers/authController.js)
Edit controllers/authController.js:

javascript
Copy
Edit
import { StatusCodes } from "http-status-codes";
import User from "../models/UserModel.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError } from "../errors/customError.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async (req, res) => {
  const isFirstAccount = (await User.count()) === 0;
  req.body.role = isFirstAccount ? "admin" : "user";

  req.body.password = await hashPassword(req.body.password);

  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "User created" });
};

export const login = async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) throw new UnauthenticatedError("Invalid credentials");

  const isPasswordCorrect = await comparePassword(req.body.password, user.password);

  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid credentials");

  const token = createJWT({ userId: user.id, role: user.role });

  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.status(StatusCodes.OK).json({ msg: "User logged in" });
};

export const logout = (req, res) => {
  res.cookie("token", "logout", { httpOnly: true, expires: new Date(0) });
  res.status(StatusCodes.OK).json({ msg: "User logged out!" });
};



📌 Step 10: Setup Routes (routes/authRoutes.js)
javascript
Copy
Edit
import { Router } from "express";
import { login, register, logout } from "../controllers/authController.js";
import rateLimiter from "express-rate-limit";

const router = Router();

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { msg: "Too many requests, please try again later" },
});

router.post("/register", apiLimiter, register);
router.post("/login", apiLimiter, login);
router.get("/logout", logout);

export default router;


📌 Step 11: Setup the Server (server.js)
javascript
Copy
Edit
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import sequelize from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true }); // Sync database
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

startServer();


