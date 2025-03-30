// routes/upload.js
import express from 'express';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/multerMiddleware.js'; // your multer config
import { formatImage } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const base64Image = formatImage(req.file);
    cloudinary.uploader.upload(base64Image, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Upload failed' });
      }
      res.json({ fileUrl: result.secure_url });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

export default router;
