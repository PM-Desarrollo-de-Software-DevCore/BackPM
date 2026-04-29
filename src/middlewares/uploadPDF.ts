import multer from 'multer';

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

export const uploadPDF = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});
