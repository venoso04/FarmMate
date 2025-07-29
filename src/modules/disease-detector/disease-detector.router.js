// /diseaese-detector.router.js

import express from 'express';
import { uploadMemory, handleMulterError } from '../../utils/multer.config.js';
import { analyzeDisease, getDiseaseHistory } from './disease-detector.controller.js';
import { authenticateToken } from '../../middleware/authentication.js';

export const diseaseDetectorRouter = express.Router();

/**
 * @route   POST /api/disease-detection/analyze
 * @desc    Analyze plant disease from uploaded image  
 * @access  Public (or add auth middleware if needed)
 */
diseaseDetectorRouter.post('/analyze',authenticateToken, uploadMemory.single('image'), analyzeDisease);

/**
 * @route   GET /api/disease-detection/history/:userId
 * @desc    Get disease detection history for a user
 * @access  Private (add auth middleware)
 */
diseaseDetectorRouter.get('/history/:userId', getDiseaseHistory);

/**
 * @route   GET /api/disease-detection/supported-plants
 * @desc    Get list of supported plants and diseases
 * @access  Public
 */
diseaseDetectorRouter.get('/supported-plants', (req, res) => {
    const { DISEASE_CLASSES } = require('../controllers/diseaseDetection.controller');
    
    // Group diseases by plant
    const plantGroups = {};
    
    Object.entries(DISEASE_CLASSES).forEach(([key, info]) => {
        const plant = info.plant_en;
        if (!plantGroups[plant]) {
            plantGroups[plant] = {
                plant_ar: info.plant,
                plant_en: info.plant_en,
                diseases: []
            };
        }
        
        plantGroups[plant].diseases.push({
            disease_key: key,
            disease_ar: info.name_ar,
            disease_en: info.name_en,
            is_healthy: info.name_ar === 'صحي'
        });
    });

    res.json({
        success: true,
        message: 'قائمة النباتات والأمراض المدعومة',
        message_en: 'Supported plants and diseases list',
        data: {
            total_plants: Object.keys(plantGroups).length,
            total_diseases: Object.keys(DISEASE_CLASSES).length,
            plants: plantGroups
        }
    });
});

/**
 * @route   GET /api/disease-detection/treatment/:diseaseKey
 * @desc    Get treatment recommendations for a specific disease
 * @access  Public
 */
diseaseDetectorRouter.get('/treatment/:diseaseKey', (req, res) => {
    const { DISEASE_CLASSES, TREATMENT_RECOMMENDATIONS } = require('../controllers/diseaseDetection.controller');
    const { diseaseKey } = req.params;
    
    const diseaseInfo = DISEASE_CLASSES[diseaseKey];
    
    if (!diseaseInfo) {
        return res.status(404).json({
            success: false,
            message: 'المرض غير موجود في قاعدة البيانات',
            message_en: 'Disease not found in database'
        });
    }
    
    const treatment = TREATMENT_RECOMMENDATIONS[diseaseInfo.name_ar] || 
                     TREATMENT_RECOMMENDATIONS['صحي'];

    res.json({
        success: true,
        message: 'تم استرداد معلومات العلاج بنجاح',
        message_en: 'Treatment information retrieved successfully',
        data: {
            disease_info: diseaseInfo,
            treatment_recommendations: treatment
        }
    });
});

/**
 * @route   GET /api/disease-detection/status
 * @desc    Check AI service status
 * @access  Public
 */
diseaseDetectorRouter.get('/status', async (req, res) => {
    try {
        const fetch = require('node-fetch');
        const AI_SERVICE_URL = 'https://anabil111-plantsv2.hf.space';
        
        const response = await fetch(AI_SERVICE_URL, { 
            timeout: 10000,
            method: 'GET'
        });
        
        res.json({
            success: true,
            message: 'خدمة الذكاء الاصطناعي تعمل بشكل طبيعي',
            message_en: 'AI service is running normally',
            data: {
                ai_service_status: response.status,
                ai_service_url: AI_SERVICE_URL,
                response_time: new Date().toISOString()
            }
        });
        
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً',
            message_en: 'AI service is currently unavailable',
            error: error.message
        });
    }
});

// Add multer error handling middleware
diseaseDetectorRouter.use(handleMulterError);

