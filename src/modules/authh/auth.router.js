import Router from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { login, signup, verifyEmail } from './auth.controller.js';
import { validation } from '../../middleware/validation.js';
import { loginValidation, signupValidation } from './auth.validation.js';


export const authRouter = Router();


authRouter.post('/sign-up',validation(signupValidation),asyncHandler(signup))

authRouter.post('/sign-in',validation(loginValidation),asyncHandler(login))

// verify account
authRouter.get(
     '/verify-email',
     verifyEmail)
