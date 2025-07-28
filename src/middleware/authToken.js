
// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../../db/models/user.model.js';


export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'رمز الوصول مطلوب / Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود / User not found'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({
            success: false,
            message: 'رمز وصول غير صحيح / Invalid access token'
        });
    }
};