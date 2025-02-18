import multer from "multer";
import DataParser from "datauri/parser.js";
import path from "path";

// Setup multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// DataUri parser to convert buffer into base64 format
const parser = new DataParser();

export const formatImage = (file) => {
  const fileExtension = path.extname(file.originalname).toString();
  return parser.format(fileExtension, file.buffer).content;
};

export default upload;
