
import Joi from 'joi';

export const signupValidation = Joi.object({

    governate: Joi.string()
        .required()
        .messages({
            'any.required': 'المحافظة مطلوبة / Governate is required'
        }),
    
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'يرجى إدخال بريد إلكتروني صحيح / Please enter a valid email',
            'any.required': 'البريد الإلكتروني مطلوب / Email is required'
        }),
    
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*\d)(?=.*[a-zA-Z])/)
        .required()
        .messages({
            'string.min': 'كلمة المرور يجب أن تكون على الأقل 8 أحرف / Password must be at least 8 characters',
            'string.pattern.base': 'كلمة المرور يجب أن تحتوي على حرف ورقم واحد على الأقل / Password must contain at least one letter and one number',
            'any.required': 'كلمة المرور مطلوبة / Password is required'
        }),
    
    roles: Joi.string()
        .valid('مستخدم', 'شركة')
        .optional()
        .messages({
            'any.only': 'الدور يجب أن يكون مستخدم أو شركة / Role must be either مستخدم or شركة'
        }),
     username: Joi.string()
    //allow it to accept arabic numbers
     //    .regex(/^[a-zA-Z0-9\u0621-\u064A\u0660-\u0669\u06f0-\u06f9]+$/)
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.min': 'اسم المستخدم يجب أن يكون على الأقل 3 أحرف / Username must be at least 3 characters',
            'string.max': 'اسم المستخدم يجب أن يكون أقل من 30 حرف / Username must be less than 30 characters',
            'any.required': 'اسم المستخدم مطلوب / Username is required'
        }),
});

export const loginValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'يرجى إدخال بريد إلكتروني صحيح / Please enter a valid email',
            'any.required': 'البريد الإلكتروني مطلوب / Email is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'كلمة المرور مطلوبة / Password is required'
        })
});

export const updateUserValidation = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .optional()
        .messages({
            'string.min': 'اسم المستخدم يجب أن يكون على الأقل 3 أحرف / Username must be at least 3 characters',
            'string.max': 'اسم المستخدم يجب أن يكون أقل من 30 حرف / Username must be less than 30 characters'
        }),
    
    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'يرجى إدخال بريد إلكتروني صحيح / Please enter a valid email'
        }),
    
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*\d)(?=.*[a-zA-Z])/)
        .optional()
        .messages({
            'string.min': 'كلمة المرور يجب أن تكون على الأقل 8 أحرف / Password must be at least 8 characters',
            'string.pattern.base': 'كلمة المرور يجب أن تحتوي على حرف ورقم واحد على الأقل / Password must contain at least one letter and one number'
        }),
    
    roles: Joi.string()
        .valid('مستخدم', 'شركة')
        .optional()
        .messages({
            'any.only': 'الدور يجب أن يكون مستخدم أو شركة / Role must be either مستخدم or شركة'
        })
});