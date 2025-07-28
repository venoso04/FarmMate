import rateLimit from 'express-rate-limit';

export const preSignupLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // Limit each IP to 5 requests per `windowMs`
     message: 'Too many attempts from this IP, please try again after 15 minutes',
     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
 });