import jwt from 'jsonwebtoken';
import { User } from '../../db/models/user.model.js';




// Authentication Middleware
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'يرجى تسجيل الدخول أولاً / Please login first'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user in database
        const user = await User.findById(decoded.userId).select('-password -verificationToken');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود / User not found'
            });
        }

        // Check if email is verified
        if (!user.verifyEmail) {
            return res.status(403).json({
                success: false,
                message: 'يرجى تأكيد بريدك الإلكتروني أولاً / Please verify your email first'
            });
        }

        // Add user info to request object
        req.user = {
            userId: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            governate: user.governate
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'رمز دخول غير صحيح / Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية رمز الدخول / Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'خطأ في الخادم / Server error'
        });
    }
};
