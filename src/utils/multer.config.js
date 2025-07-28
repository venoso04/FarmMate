import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


// Create uploads directory if it doesn't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store files temporarily in uploads folder
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, name);
    }
});

// Memory storage (recommended for AI processing)
const memoryStorage = multer.memoryStorage();

// File filter function
const imageFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        // Allow common image formats
        const allowedMimes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/bmp',
            'image/tiff'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('نوع الصورة غير مدعوم. يرجى رفع صور بصيغة JPG، PNG، أو WEBP'), false);
        }
    } else {
        cb(new Error('يجب رفع ملف صورة فقط'), false);
    }
};

// Multer configurations for different use cases

// 1. Memory storage for AI processing (recommended)
 const uploadMemory = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
        files: 1, // Only allow 1 file at a time
        fieldSize: 10 * 1024 * 1024, // 10MB max field size
    },
    fileFilter: imageFilter
});

// 2. Disk storage for keeping files
 const uploadDisk = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
    },
    fileFilter: imageFilter
});

// 3. Strict configuration for production
 const uploadStrict = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max for production
        files: 1,
        fieldNameSize: 100, // Max field name size
        fieldSize: 5 * 1024 * 1024, // Max field value size
        fields: 10, // Max number of non-file fields
        headerPairs: 2000 // Max number of header key-value pairs
    },
    fileFilter: (req, file, cb) => {
        console.log('📁 Uploading file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size || 'unknown'
        });

        // Enhanced validation
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('يجب رفع صورة فقط'), false);
        }

        // Check file extension matches mimetype
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeToExt = {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/bmp': ['.bmp'],
            'image/tiff': ['.tiff', '.tif']
        };

        const allowedExts = mimeToExt[file.mimetype];
        if (allowedExts && !allowedExts.includes(ext)) {
            return cb(new Error('امتداد الملف لا يتطابق مع نوع الصورة'), false);
        }

        // Check filename for security (no path traversal)
        if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
            return cb(new Error('اسم الملف غير صالح'), false);
        }

        cb(null, true);
    }
});

// 4. Multiple files configuration (if needed later)
 const uploadMultiple = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 5, // Max 5 files
    },
    fileFilter: imageFilter
});

// Error handling middleware
 const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        let message = 'خطأ في رفع الملف';
        let message_en = 'File upload error';

        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت';
                message_en = 'File too large. Maximum size is 10MB';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'عدد الملفات كثير جداً. يمكن رفع ملف واحد فقط';
                message_en = 'Too many files. Only 1 file allowed';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'حقل الملف غير متوقع';
                message_en = 'Unexpected file field';
                break;
            case 'LIMIT_FIELD_COUNT':
                message = 'عدد الحقول كثير جداً';
                message_en = 'Too many fields';
                break;
            case 'LIMIT_FIELD_KEY':
                message = 'اسم الحقل طويل جداً';
                message_en = 'Field name too long';
                break;
            case 'LIMIT_FIELD_VALUE':
                message = 'قيمة الحقل كبيرة جداً';
                message_en = 'Field value too large';
                break;
            case 'LIMIT_PART_COUNT':
                message = 'عدد أجزاء الملف كثير جداً';
                message_en = 'Too many parts';
                break;
        }

        return res.status(400).json({
            success: false,
            message: message,
            message_en: message_en,
            error_code: error.code
        });
    }

    // Handle custom file filter errors
    if (error.message) {
        return res.status(400).json({
            success: false,
            message: error.message,
            message_en: 'File validation failed'
        });
    }

    // Pass other errors to default error handler
    next(error);
};

// Utility functions
 const cleanupFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('🗑️  Cleaned up temporary file:', filePath);
        }
    } catch (error) {
        console.error('Error cleaning up file:', error);
    }
};

 const validateImageDimensions = (buffer) => {
    // You can add image dimension validation here if needed
    // For now, just check if it's a valid buffer
    return buffer && buffer.length > 0;
};

// Export configurations
export {
    uploadMemory,
    uploadDisk,
    uploadStrict,
    uploadMultiple,
    handleMulterError,
    cleanupFile,
    validateImageDimensions,
    uploadsDir as UPLOAD_DIR,
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_MIMES = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/webp',
    'image/bmp',
    'image/tiff'
];