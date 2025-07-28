// controllers/diseaese-detector.controller.js
import FormData from 'form-data';
import fetch from 'node-fetch';
import { validateImageDimensions } from '../../utils/multer.config.js';


// AI service configuration
const AI_SERVICE_URL = 'https://anabil111-plantsv2.hf.space';

/**
 * Complete disease class mappings from your AI engineer
 */
const DISEASE_CLASSES = {
    // Apple diseases
    'تفاح - جرب التفاح': {
        name_ar: 'جرب التفاح',
        name_en: 'Apple Scab',
        plant: 'تفاح',
        plant_en: 'Apple'
    },
    'تفاح - عفن أسود': {
        name_ar: 'عفن أسود',
        name_en: 'Black Rot',
        plant: 'تفاح',
        plant_en: 'Apple'
    },
    'تفاح - صدأ التفاح العرعر': {
        name_ar: 'صدأ التفاح العرعر',
        name_en: 'Cedar Apple Rust',
        plant: 'تفاح',
        plant_en: 'Apple'
    },
    'تفاح - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'تفاح',
        plant_en: 'Apple'
    },

    // Blueberry
    'توت أزرق - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'توت أزرق',
        plant_en: 'Blueberry'
    },

    // Cherry
    'كرز (بما في ذلك الحامض) - البياض الدقيقي': {
        name_ar: 'البياض الدقيقي',
        name_en: 'Powdery Mildew',
        plant: 'كرز',
        plant_en: 'Cherry'
    },
    'كرز (بما في ذلك الحامض) - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'كرز',
        plant_en: 'Cherry'
    },

    // Corn
    'ذرة (ذرة شامية) - تبقع سركسبورا البقعة الرمادية': {
        name_ar: 'تبقع سركسبورا البقعة الرمادية',
        name_en: 'Cercospora Leaf Spot Gray Leaf Spot',
        plant: 'ذرة',
        plant_en: 'Corn'
    },
    'ذرة (ذرة شامية) - صدأ شائع': {
        name_ar: 'صدأ شائع',
        name_en: 'Common Rust',
        plant: 'ذرة',
        plant_en: 'Corn'
    },
    'ذرة (ذرة شامية) - لفحة الأوراق الشمالية': {
        name_ar: 'لفحة الأوراق الشمالية',
        name_en: 'Northern Leaf Blight',
        plant: 'ذرة',
        plant_en: 'Corn'
    },
    'ذرة (ذرة شامية) - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'ذرة',
        plant_en: 'Corn'
    },

    // Grape
    'عنب - عفن أسود': {
        name_ar: 'عفن أسود',
        name_en: 'Black Rot',
        plant: 'عنب',
        plant_en: 'Grape'
    },
    'عنب - إسكا (الحصبة السوداء)': {
        name_ar: 'إسكا (الحصبة السوداء)',
        name_en: 'Esca (Black Measles)',
        plant: 'عنب',
        plant_en: 'Grape'
    },
    'عنب - لفحة الأوراق (تبقع أوراق الإيزاريوبسيس)': {
        name_ar: 'لفحة الأوراق (تبقع أوراق الإيزاريوبسيس)',
        name_en: 'Leaf Blight (Isariopsis Leaf Spot)',
        plant: 'عنب',
        plant_en: 'Grape'
    },
    'عنب - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'عنب',
        plant_en: 'Grape'
    },

    // Orange/Citrus
    'برتقال - هوانغلونغبينغ (اخضرار الحمضيات)': {
        name_ar: 'هوانغلونغبينغ (اخضرار الحمضيات)',
        name_en: 'Huanglongbing (Citrus Greening)',
        plant: 'برتقال',
        plant_en: 'Orange'
    },

    // Peach
    'خوخ - تبقع بكتيري': {
        name_ar: 'تبقع بكتيري',
        name_en: 'Bacterial Spot',
        plant: 'خوخ',
        plant_en: 'Peach'
    },
    'خوخ - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'خوخ',
        plant_en: 'Peach'
    },

    // Bell Pepper
    'فلفل حلو - تبقع بكتيري': {
        name_ar: 'تبقع بكتيري',
        name_en: 'Bacterial Spot',
        plant: 'فلفل حلو',
        plant_en: 'Bell Pepper'
    },
    'فلفل حلو - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'فلفل حلو',
        plant_en: 'Bell Pepper'
    },

    // Potato
    'بطاطس - لفحة مبكرة': {
        name_ar: 'لفحة مبكرة',
        name_en: 'Early Blight',
        plant: 'بطاطس',
        plant_en: 'Potato'
    },
    'بطاطس - لفحة متأخرة': {
        name_ar: 'لفحة متأخرة',
        name_en: 'Late Blight',
        plant: 'بطاطس',
        plant_en: 'Potato'
    },
    'بطاطس - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'بطاطس',
        plant_en: 'Potato'
    },

    // Raspberry
    'توت عليق - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'توت عليق',
        plant_en: 'Raspberry'
    },

    // Soybean
    'فول صويا - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'فول صويا',
        plant_en: 'Soybean'
    },

    // Squash
    'قرع - البياض الدقيقي': {
        name_ar: 'البياض الدقيقي',
        name_en: 'Powdery Mildew',
        plant: 'قرع',
        plant_en: 'Squash'
    },

    // Strawberry
    'فراولة - لفحة الأوراق': {
        name_ar: 'لفحة الأوراق',
        name_en: 'Leaf Scorch',
        plant: 'فراولة',
        plant_en: 'Strawberry'
    },
    'فراولة - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'فراولة',
        plant_en: 'Strawberry'
    },

    // Tomato
    'طماطم - تبقع بكتيري': {
        name_ar: 'تبقع بكتيري',
        name_en: 'Bacterial Spot',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - لفحة مبكرة': {
        name_ar: 'لفحة مبكرة',
        name_en: 'Early Blight',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - لفحة متأخرة': {
        name_ar: 'لفحة متأخرة',
        name_en: 'Late Blight',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - عفن الأوراق': {
        name_ar: 'عفن الأوراق',
        name_en: 'Leaf Mold',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - تبقع سبتوريا الأوراق': {
        name_ar: 'تبقع سبتوريا الأوراق',
        name_en: 'Septoria Leaf Spot',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - عناكب حمراء عنكبوت ذو نقطتين': {
        name_ar: 'عناكب حمراء عنكبوت ذو نقطتين',
        name_en: 'Spider Mites Two-spotted Spider Mite',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - بقعة الهدف': {
        name_ar: 'بقعة الهدف',
        name_en: 'Target Spot',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - فيروس تجعد الأوراق الصفر للطماطم': {
        name_ar: 'فيروس تجعد الأوراق الصفر للطماطم',
        name_en: 'Tomato Yellow Leaf Curl Virus',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - فيروس فسيفساء الطماطم': {
        name_ar: 'فيروس فسيفساء الطماطم',
        name_en: 'Tomato Mosaic Virus',
        plant: 'طماطم',
        plant_en: 'Tomato'
    },
    'طماطم - صحي': {
        name_ar: 'صحي',
        name_en: 'Healthy',
        plant: 'طماطم',
        plant_en: 'Tomato'
    }
};

/**
 * Treatment recommendations for diseases
 */
const TREATMENT_RECOMMENDATIONS = {
    'تبقع بكتيري': {
        treatment_ar: 'استخدم مبيد بكتيري نحاسي، تحسين التهوية، تجنب الري على الأوراق',
        treatment_en: 'Use copper-based bactericide, improve air circulation, avoid overhead watering',
        prevention_ar: 'زراعة أصناف مقاومة، تطهير الأدوات، تدوير المحاصيل',
        prevention_en: 'Plant resistant varieties, sterilize tools, crop rotation'
    },
    'لفحة مبكرة': {
        treatment_ar: 'استخدام مبيد فطري، إزالة الأوراق المصابة، تحسين التصريف',
        treatment_en: 'Use fungicide, remove infected leaves, improve drainage',
        prevention_ar: 'تجنب الري على الأوراق، التباعد المناسب، تنظيف الحقل',
        prevention_en: 'Avoid leaf watering, proper spacing, field sanitation'
    },
    'لفحة متأخرة': {
        treatment_ar: 'مبيد فطري وقائي، تحسين التهوية، تجنب الرطوبة العالية',
        treatment_en: 'Preventive fungicide, improve ventilation, avoid high humidity',
        prevention_ar: 'مراقبة الطقس، زراعة أصناف مقاومة، تجنب الري المسائي',
        prevention_en: 'Weather monitoring, resistant varieties, avoid evening irrigation'
    },
    'البياض الدقيقي': {
        treatment_ar: 'مبيد فطري خاص بالبياض الدقيقي، تحسين التهوية',
        treatment_en: 'Powdery mildew specific fungicide, improve air circulation',
        prevention_ar: 'تجنب الازدحام، الري من الأسفل، إزالة الأوراق المصابة',
        prevention_en: 'Avoid overcrowding, water from below, remove infected leaves'
    },
    'عفن أسود': {
        treatment_ar: 'مبيد فطري، إزالة الأجزاء المصابة، تحسين التصريف',
        treatment_en: 'Fungicide application, remove infected parts, improve drainage',
        prevention_ar: 'تجنب الجروح في النبات، تقليم منتظم، تهوية جيدة',
        prevention_en: 'Avoid plant wounds, regular pruning, good ventilation'
    },
    'صحي': {
        treatment_ar: 'النبات سليم، استمر في الرعاية العادية',
        treatment_en: 'Plant is healthy, continue normal care',
        prevention_ar: 'حافظ على الري المنتظم والتسميد المتوازن',
        prevention_en: 'Maintain regular watering and balanced fertilization'
    }
};

/**
 * Analyze plant disease from uploaded image
 */
export const analyzeDisease = async (req, res) => {
    try {
        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع صورة. يرجى رفع صورة النبات المراد تحليلها',
                message_en: 'No image uploaded. Please upload a plant image for analysis'
            });
        }

        // Additional validation
        if (!validateImageDimensions(req.file.buffer)) {
            return res.status(400).json({
                success: false,
                message: 'الصورة المرفوعة تالفة أو فارغة',
                message_en: 'Uploaded image is corrupted or empty'
            });
        }

        console.log(`📷 Processing image: ${req.file.originalname}`);
        console.log(`📊 Size: ${Math.round(req.file.size / 1024)}KB`);
        console.log(`🎭 Type: ${req.file.mimetype}`);

        // Call the AI service
        const analysisResult = await callDiseaseDetectionAPI(req.file);
        
        // Process and return results
        const response = {
            success: true,
            message: 'تم تحليل الصورة بنجاح',
            message_en: 'Image analyzed successfully',
            data: {
                filename: req.file.originalname,
                filesize: req.file.size,
                analysis: analysisResult,
                timestamp: new Date().toISOString()
            }
        };

        res.json(response);

    } catch (error) {
        console.error('🚨 Disease detection error:', error);
        
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى',
            message_en: 'An error occurred while analyzing the image. Please try again',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

//////////////////////////////////////////////////////////////////////////////////



/**
 * Get disease detection history for a user
 */
export const getDiseaseHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // TODO: Implement database query to get user's analysis history
        // const history = await DiseaseAnalysis.find({ userId }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            message: 'تم استرداد السجل بنجاح',
            message_en: 'History retrieved successfully',
            data: {
                userId,
                history: [],
                message: 'Feature coming soon - connect to database'
            }
        });
    } catch (error) {
        console.error('Error getting disease history:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في استرداد السجل',
            message_en: 'Error retrieving history'
        });
    }
};

/**
 * Call the AI disease detection service
 */
async function callDiseaseDetectionAPI(imageFile) {
    try {
        console.log('🤖 Calling AI service...');
        
        const formData = new FormData();
        formData.append('file', imageFile.buffer, {
            filename: imageFile.originalname,
            contentType: imageFile.mimetype
        });

        const response = await fetch(`${AI_SERVICE_URL}/predict`, {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });

        if (!response.ok) {
            throw new Error(`AI service responded with status: ${response.status}`);
        }

        const result = await response.json();
        console.log('🎯 AI Response:', result);
        
        return processAIResponse(result);

    } catch (error) {
        console.error('AI service error:', error);
        throw new Error('AI service is currently unavailable');
    }
}

/**
 * Process the AI service response and format it properly
 */
function processAIResponse(aiResult) {
    try {
        // Handle different response formats
        let predictions = [];
        
        if (aiResult.predictions && Array.isArray(aiResult.predictions)) {
            // Format: { predictions: [...] }
            predictions = aiResult.predictions;
        } else if (Array.isArray(aiResult)) {
            // Format: [...]
            predictions = aiResult;
        } else if (aiResult.class && aiResult.confidence) {
            // Format: { class: "...", confidence: 0.xx }
            predictions = [{ label: aiResult.class, confidence: aiResult.confidence }];
        } else {
            throw new Error('Unknown AI response format');
        }

        // Sort by confidence and get top predictions
        const sortedPredictions = predictions
            .sort((a, b) => (b.confidence || b.score || 0) - (a.confidence || a.score || 0))
            .slice(0, 3);

        const topPrediction = sortedPredictions[0];
        const confidence = topPrediction.confidence || topPrediction.score || 0;
        const diseaseKey = topPrediction.label || topPrediction.class;

        // Get disease information
        const diseaseInfo = DISEASE_CLASSES[diseaseKey] || {
            name_ar: diseaseKey,
            name_en: diseaseKey,
            plant: 'غير محدد',
            plant_en: 'Unknown'
        };

        // Get treatment recommendations
        const treatment = TREATMENT_RECOMMENDATIONS[diseaseInfo.name_ar] || 
                         TREATMENT_RECOMMENDATIONS['صحي'];

        return {
            disease_detected: confidence > 0.5 && diseaseInfo.name_ar !== 'صحي',
            confidence_threshold: confidence > 0.5,
            top_prediction: {
                disease_key: diseaseKey,
                disease_name_ar: diseaseInfo.name_ar,
                disease_name_en: diseaseInfo.name_en,
                plant_ar: diseaseInfo.plant,
                plant_en: diseaseInfo.plant_en,
                confidence: Math.round(confidence * 100)
            },
            all_predictions: sortedPredictions.map(pred => ({
                disease_key: pred.label || pred.class,
                confidence: Math.round((pred.confidence || pred.score || 0) * 100),
                disease_info: DISEASE_CLASSES[pred.label || pred.class]
            })),
            recommendations: treatment,
            analysis_metadata: {
                total_classes: Object.keys(DISEASE_CLASSES).length,
                model_version: 'v2',
                processing_time: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Error processing AI response:', error);
        return {
            disease_detected: false,
            error: 'Failed to process AI response',
            raw_result: aiResult
        };
    }
}

// module.exports = {
//     analyzeDisease,
//     getDiseaseHistory,
//     DISEASE_CLASSES,
//     TREATMENT_RECOMMENDATIONS
// };