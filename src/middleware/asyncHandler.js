import { AppError } from "../utils/common/appError.js";

export const asyncHandler = (fn) => {
     if (typeof fn !== 'function') {
         throw new TypeError('Expected a function');
     }
     
     return (req, res, next) => {
         Promise.resolve(fn(req, res, next)).catch((err) => {
             next(new AppError(err.message, err.statusCode || 500));
         });
     };
 };

// Global error handler
export const globalErrorHandling = ((error, req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size exceeds the 5MB limit.",
    });
  }
  
  const statusCode = error.status || 500;

  // Log the error stack to the console
  console.error(`Error: ${error.message} \n Stack: ${error.stack} \n Status Code: ${statusCode}`);

  // Send a response to the client
  res.status(statusCode).json({
    success: false,
    message: error.message,
  });
});
