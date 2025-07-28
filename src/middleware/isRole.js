import { messages } from "../utils/common/mesages";

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
     if (req.user.role !== 'admin') {
         return res.status(403).json({ message: messages.denyAccessAdminsOnly });
     }
     next();
 };

 const isMember = (req, res, next) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied: Members only' });
    }
    next();
};