/**
 * Materials Routes Module
 * 
 * Handles all study material-related API endpoints including:
 * - Getting materials for a course
 * - Uploading new materials (with multer)
 * - Downloading materials
 * - Deleting materials
 * 
 * @module routes/materials
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const {
  getMaterialsByCourse,
  getMaterialById,
  addMaterial,
  incrementDownloadCount,
  deleteMaterial,
  getCourseById
} = require('../database');

// ==================== MULTER CONFIGURATION ====================

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${extension}`);
  }
});

// File filter for validating file types
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  
  // Check both MIME type and extension
  const isMimeTypeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(extension);
  
  if (isMimeTypeAllowed && isExtensionAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow single file upload
  }
});

// ==================== ROUTES ====================

/**
 * GET /api/materials/:courseId
 * Get all materials for a specific course
 * 
 * Parameters:
 *   - courseId: Course ID (e.g., COMP1080SEF)
 * 
 * Response: Array of material objects
 */
router.get('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Validate course ID
    if (!courseId || typeof courseId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Course ID is required'
      });
    }

    // Check if course exists
    const course = await getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Course with ID '${courseId}' not found`
      });
    }

    const materials = await getMaterialsByCourse(courseId);

    // Format file sizes for display
    const formattedMaterials = materials.map(material => ({
      ...material,
      file_size_formatted: formatFileSize(material.file_size)
    }));

    res.json({
      success: true,
      courseId,
      courseName: course.name,
      count: materials.length,
      data: formattedMaterials
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/materials
 * Upload a new material for a course
 * 
 * Request Body (multipart/form-data):
 *   - course_id: Course ID (required)
 *   - uploaded_by: Uploader name (required)
 *   - uploader_id: Uploader ID (required)
 *   - description: Material description (optional)
 *   - file: File to upload (required, max 50MB)
 * 
 * Response: Created material object
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'Missing File',
        message: 'No file uploaded. Please provide a file with key "file"'
      });
    }

    const { course_id, uploaded_by, uploader_id, description } = req.body;

    // Validate required fields
    const requiredFields = ['course_id', 'uploaded_by', 'uploader_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        error: 'Missing Required Fields',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate course exists
    const course = await getCourseById(course_id);
    if (!course) {
      // Delete uploaded file if course not found
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        error: 'Not Found',
        message: `Course with ID '${course_id}' not found`
      });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        error: 'Invalid Description',
        message: 'Description must not exceed 500 characters'
      });
    }

    // Create material record
    const materialData = {
      course_id,
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      description: description ? description.trim() : null,
      uploaded_by: uploaded_by.trim(),
      uploader_id
    };

    const newMaterial = await addMaterial(materialData);

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      data: {
        ...newMaterial,
        file_size_formatted: formatFileSize(req.file.size)
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * GET /api/materials/download/:id
 * Download a material file
 * 
 * Parameters:
 *   - id: Material ID
 * 
 * Response: File download
 */
router.get('/download/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate material ID
    const materialId = parseInt(id, 10);
    if (isNaN(materialId) || materialId <= 0) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Material ID must be a positive number'
      });
    }

    // Get material from database
    const material = await getMaterialById(materialId);

    if (!material) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Material with ID '${materialId}' not found`
      });
    }

    // Construct file path
    const filePath = path.join(__dirname, '..', 'uploads', material.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File Not Found',
        message: 'The file has been removed or is no longer available'
      });
    }

    // Increment download count
    await incrementDownloadCount(materialId);

    // Set headers for file download
    res.setHeader('Content-Type', material.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(material.original_name)}"`);
    res.setHeader('Content-Length', material.file_size);

    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/materials/:id
 * Delete a material
 * 
 * Parameters:
 *   - id: Material ID
 * 
 * Query Parameters:
 *   - user_id: User ID (for authorization)
 * 
 * Response: Success message
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    // Validate material ID
    const materialId = parseInt(id, 10);
    if (isNaN(materialId) || materialId <= 0) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Material ID must be a positive number'
      });
    }

    // Validate user_id for authorization
    if (!user_id) {
      return res.status(400).json({
        error: 'Missing Parameter',
        message: 'user_id is required as query parameter'
      });
    }

    // Get material to find file path
    const material = await getMaterialById(materialId);

    if (!material) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Material with ID '${materialId}' not found`
      });
    }

    // Note: In a real application, verify that the user owns the material
    // or has admin privileges before deleting
    // For this demo, we just check if the material exists

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', 'uploads', material.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from database
    const success = await deleteMaterial(materialId);

    if (!success) {
      return res.status(500).json({
        error: 'Delete Failed',
        message: 'Failed to delete material from database'
      });
    }

    res.json({
      success: true,
      message: 'Material deleted successfully',
      materialId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/materials/info/:id
 * Get material information without downloading
 * 
 * Parameters:
 *   - id: Material ID
 * 
 * Response: Material object
 */
router.get('/info/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate material ID
    const materialId = parseInt(id, 10);
    if (isNaN(materialId) || materialId <= 0) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Material ID must be a positive number'
      });
    }

    const material = await getMaterialById(materialId);

    if (!material) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Material with ID '${materialId}' not found`
      });
    }

    res.json({
      success: true,
      data: {
        ...material,
        file_size_formatted: formatFileSize(material.file_size)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;
