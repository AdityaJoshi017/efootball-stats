import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Storage configuration - only create directory in non-serverless environments
let storage: multer.StorageEngine;

if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // Serverless environment - use memory storage (no file system access)
  storage = multer.memoryStorage();
} else {
  // Local/Render environment - use disk storage
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  // Ensure upload directory exists (only in non-serverless environments)
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Could not create upload directory:', error);
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
  }
};

// Configure multer
const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});
