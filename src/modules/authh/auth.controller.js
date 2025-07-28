// controllers/authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { User } from '../../../db/models/user.model.js';
import { signupValidation ,loginValidation, updateUserValidation} from './auth.validation.js';
import sendEmail from '../../utils/common/sendEmail.js';

dotenv.config();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate Email Verification Token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Email Templates
const getVerificationEmailTemplate = (username, verificationLink) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin-bottom: 10px;">مرحباً ${username}</h1>
                <h1 style="color: #333; margin-bottom: 20px;">Welcome ${username}</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <p style="font-size: 16px; color: #555; margin-bottom: 15px;">
                    شكراً لتسجيلك معنا! يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:
                </p>
                <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                    Thank you for signing up! Please click the link below to verify your email:
                </p>
                
                <div style="text-align: center;">
                    <a href="${verificationLink}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;
                              font-weight: bold;">
                        تأكيد البريد الإلكتروني / Verify Email
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
                <p>إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد</p>
                <p>If you didn't create this account, please ignore this email</p>
            </div>
        </div>
    `;
};


// Signup Controller
export const signup = async (req, res) => {
    try {


        const { username, email, password,governate, roles } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'المستخدم موجود مسبقاً / User already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            governate,
            roles: roles || 'مستخدم',
            verifyEmail: false,
            verificationToken
        });

        await user.save();

        // Generate verification link
        // const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;
  const verificationLink = `${req.protocol}://${req.headers.host}/api/auth/verify-email?token=${verificationToken}`;

        // Send verification email
        const emailSent = await sendEmail({
            to: email,
            subject: 'تأكيد البريد الإلكتروني / Email Verification',
            message: getVerificationEmailTemplate(username, verificationLink)
        });

if (!emailSent) {
    // Rollback: Delete uploaded profile picture from Cloudinary and the member record from the database
    try {

      await User.findByIdAndDelete(user._id);
    } catch (rollbackError) {
      console.error("Failed to rollback after email send failure:", rollbackError);
    }

    return next(new AppError("Email could not be sent - خطأ في ارسال الايميل ", 500));
  }

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح. يرجى تأكيد بريدك الإلكتروني / Account created successfully. Please verify your email',
            data: {
                userId: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
                verifyEmail: user.verifyEmail
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم / Server error'
        });
    }
};

// Login Controller
export const login = async (req, res) => {
    try {
        // Validate input
        const { error } = loginValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'بيانات دخول غير صحيحة / Invalid credentials'
            });
        }

        
        if (!user.verifyEmail) {
            return res.status(400)
      .json({
        message:
          "الايميل غير متحقق منه. يرجى التحقق من بريدك الإلكتروني / Email not verified. Please verify your email",
      })
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'بيانات دخول غير صحيحة / Invalid credentials'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح / Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                    verifyEmail: user.verifyEmail
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم / Server error'
        });
    }
};

// Email Verification Controller
// Email Verification Controller (Updated for new route structure)
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send(getVerificationErrorPage('رمز التحقق مفقود / Verification token missing'));
        }

        // Find user with verification token
        const user = await User.findOne({ 
            verificationToken: token 
        });



        // Update user verification status
        user.verifyEmail = true;
        user.verificationToken = undefined;
        await user.save();

        // Return success page
        return res.status(200).send(getVerificationSuccessPage(user.username));

    } catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).send(getVerificationErrorPage('خطأ في الخادم / Server error'));
    }
};

const getVerificationSuccessPage = (username) => {
    return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تم التحقق بنجاح - Email Verified</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                direction: rtl;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                text-align: center;
                max-width: 500px;
                width: 100%;
                animation: slideUp 0.6s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .success-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, #28a745, #20c997);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 30px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .success-icon i {
                color: white;
                font-size: 35px;
            }
            
            h1 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 2.2em;
                font-weight: 700;
            }
            
            .welcome-message {
                background: linear-gradient(45deg, #f8f9fa, #e9ecef);
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 5px solid #28a745;
            }
            
            .message {
                color: #6c757d;
                font-size: 1.1em;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            
            .username {
                color: #28a745;
                font-weight: bold;
                font-size: 1.3em;
            }
            
            .actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 30px;
            }
            
            .btn {
                padding: 12px 25px;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 1em;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                min-width: 140px;
                justify-content: center;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #007bff, #0056b3);
                color: white;
            }
            
            .btn-secondary {
                background: linear-gradient(45deg, #6c757d, #495057);
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 0.9em;
            }
            
            @media (max-width: 480px) {
                .container {
                    padding: 25px;
                }
                
                h1 {
                    font-size: 1.8em;
                }
                
                .actions {
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">
                <i class="fas fa-check"></i>
            </div>
            
            <h1>تم التحقق بنجاح!</h1>
            
            <div class="welcome-message">
                <div class="username">مرحباً ${username}!</div>
                <div style="margin-top: 10px; color: #495057;">Welcome ${username}!</div>
            </div>
            
            <div class="message">
                <p style="margin-bottom: 15px;">
                    🎉 تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن الاستفادة من جميع خدماتنا والبدء في استخدام حسابك.
                </p>
                <p>
                    🎉 Your email has been successfully verified! You can now enjoy all our services and start using your account.
                </p>
            </div>
            

            
            <div class="footer">
                <p>شكراً لانضمامك إلينا | Thank you for joining us</p>
                <p style="margin-top: 5px; font-size: 0.8em;">
                    يمكنك إغلاق هذه النافذة الآن | You can close this window now
                </p>
            </div>
        </div>
        
        <script>
            // Add some interactive effects
            document.addEventListener('DOMContentLoaded', function() {
                // Auto-close after 10 seconds if opened in popup
                if (window.opener) {
                    setTimeout(() => {
                        window.close();
                    }, 10000);
                }
            });
        </script>
    </body>
    </html>
    `;
};

const getVerificationErrorPage = (errorMessage) => {
    return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خطأ في التحقق - Verification Error</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                direction: rtl;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                text-align: center;
                max-width: 500px;
                width: 100%;
                animation: slideUp 0.6s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .error-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, #dc3545, #c82333);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 30px;
            }
            
            .error-icon i {
                color: white;
                font-size: 35px;
            }
            
            h1 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 2.2em;
                font-weight: 700;
            }
            
            .error-message {
                background: linear-gradient(45deg, #fff5f5, #fed7d7);
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 5px solid #dc3545;
                color: #721c24;
                font-weight: 600;
            }
            
            .message {
                color: #6c757d;
                font-size: 1.1em;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            
            .actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 30px;
            }
            
            .btn {
                padding: 12px 25px;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 1em;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                min-width: 140px;
                justify-content: center;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #007bff, #0056b3);
                color: white;
            }
            
            .btn-secondary {
                background: linear-gradient(45deg, #6c757d, #495057);
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 0.9em;
            }
            
            @media (max-width: 480px) {
                .container {
                    padding: 25px;
                }
                
                h1 {
                    font-size: 1.8em;
                }
                
                .actions {
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">
                <i class="fas fa-times"></i>
            </div>
            
            <h1>خطأ في التحقق</h1>
            
            <div class="error-message">
                ${errorMessage}
            </div>
            
            <div class="message">
                <p style="margin-bottom: 15px;">
                    ⚠️ عذراً، حدث خطأ أثناء التحقق من بريدك الإلكتروني. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
                </p>
                <p>
                    ⚠️ Sorry, an error occurred while verifying your email. Please try again or contact technical support.
                </p>
            </div>
            

            
            <div class="footer">
                <p>إذا استمرت المشكلة، يرجى التواصل معنا</p>
                <p>If the problem persists, please contact us</p>
                <p style="margin-top: 5px; font-size: 0.8em;">
                    يمكنك إغلاق هذه النافذة الآن | You can close this window now
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};


// Update User Controller
export const updateUser = async (req, res) => {
    try {
        // Validate input
        const { error } = updateUserValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const userId = req.user.userId; // From JWT middleware
        const updates = req.body;

        // If email is being updated, check if it's already taken
        if (updates.email) {
            const existingUser = await User.findOne({ 
                email: updates.email, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'البريد الإلكتروني مستخدم مسبقاً / Email already in use'
                });
            }
            // If email is updated, set verifyEmail to false
            updates.verifyEmail = false;
        }

        // Hash password if provided
        if (updates.password) {
            const saltRounds = 12;
            updates.password = await bcrypt.hash(updates.password, saltRounds);
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId, 
            updates, 
            { new: true, runValidators: true }
        ).select('-password -verificationToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود / User not found'
            });
        }

        // If email was updated, send new verification email
        if (updates.email) {
            const verificationToken = generateVerificationToken();
            user.verificationToken = verificationToken;
            await user.save();

            const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${updates.email}`;
            
            await sendEmail({
                to: updates.email,
                subject: 'تأكيد البريد الإلكتروني الجديد / New Email Verification',
                message: getVerificationEmailTemplate(user.username, verificationLink)
            });
        }

        res.status(200).json({
            success: true,
            message: 'تم تحديث المعلومات بنجاح / User updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم / Server error'
        });
    }
};

// Delete User Controller
export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.userId; // From JWT middleware

        // Find and delete user
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود / User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'تم حذف الحساب بنجاح / Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم / Server error'
        });
    }
};

// Get User Profile Controller
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // From JWT middleware

        const user = await User.findById(userId).select('-password -verificationToken');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود / User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم / Server error'
        });
    }
};
