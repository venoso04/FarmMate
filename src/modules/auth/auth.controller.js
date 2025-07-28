// import jsonwebtoken from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
// import dotenv from 'dotenv';
// // import joi from 'joi';


// import { User } from "../../../db/models/user.model.js";
// import { AppError } from "../../utils/common/appError.js";
// import { messages } from "../../utils/common/mesages.js"; 
// import sendEmail from '../../utils/common/sendEmail.js';
// import { port } from '../../../index.js';
// import { status, systemRoles } from '../../utils/common/enum.js';
// import { asyncHandler } from '../../middleware/asyncHandler.js';

// dotenv.config(); 

// // // PRE SIGNUP
// // export const preSignUp = async (req, res) => {
// //     const { sharedPassword } = req.body;
// //     const validPassword = process.env.SHARED_PASSWORD; // Securely stored
    
// //     if (sharedPassword === validPassword) {
// //         // Option 1: Redirect to signup
// //         res.status(200).json({ message: 'Access granted', redirectTo: '/signup' });
        
// //         // // Option 2: Generate temporary token
// //         // const tempToken = jwt.sign({ access: 'granted' }, process.env.JWT_SECRET, { expiresIn: '15m' });
// //         // res.status(200).json({ message: 'Access granted', token: tempToken });
// //     } else {
// //         res.status(401).json({ message: 'Invalid password' });
// //     }
// // }

// // SIGNUP
// // export const signUp = asyncHandler(async (req, res, next) => {

// //     // Get data from req
// //     const { username, email, password, role, governate } = req.body;

// //         // 2. Check for phone or email conflicts
// //     const phoneExist = await Member.findOne({ phone });
// //     if (phoneExist) {
// //         return res.status(400).json({ message: "رقم الهاتف مستخدم مسبقا" });
// //     }

// //     // const emailExist = await Member.findOne({ email });
// //     // if (emailExist) {
// //     //     return res.status(400).json({ message: "Email already in use" });
// //     // }

// //         // Check existence
// //         const userExist = await User.findOne({ email });

// //         if (userExist) {
// //             if (userExist.verifyEmail) {
// //                 return next(new AppError("الايميل مستخدم مسبقا", 409));
// //             } else {
// //                 const token = jsonwebtoken.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
// //                //  const verificationUrl = `{token}`;
// //                //  const emailMessage = ;
        
// //                 // Send email
// //  sendEmail({
// //                     to: email,
// //                     subject: "فعل حسابك",
// //                     message: `
// //                     <p> لتفعيل حسابك يرجى الضغط على الرابط التالي: 
// //                     <a href="http://localhost:${port}/auth/verify-account?token=${token}">Verify your account</a></p>
// //                 `
// //                 });

// //                //  if (!emailSent) {
// //                //      return next(new AppError('Email could not be sent', 500));
// //                //  }
        
// //                 return res.status(200).json({ message: 'Verification email sent. Please check your email.' });
// //             }
// //         }

// //         // Hash password
// //         const hashed = bcrypt.hashSync(password, 5);

// //         // Prepare user
// //         const user = new User({
// //             username,
// //             email,
// //             password: hashed,
// //             role,
// //             governate
// //         });

// //         // Save user
// //         const createdUser = await user.save();

// //         // Send response
// //         res.status(201).json({ message: messages.user.doneAndCheckEmail, success: true, data: createdUser });

// // });

// ////////////////// sign up


// export const signUp = asyncHandler(async (req, res, next) => {
//     const { username, email, password, rePassword, role, governate, phone } = req.body;
    
//     // 1. Check for required fields
//     if (!username || !email || !password || !rePassword || !role || !governate) {
//         return res.status(400).json({ message: "يوجد نقص في المعلومات المطلوبة" });
//     }
    
//     // 2. Validate role
//     if (!Object.values(systemRoles).includes(role)) {
//         return res.status(400).json({ message: "نوع المستخدم غير صحيح" });
//     }
    
//     // 3. Check for password match
//     if (password !== rePassword) {
//         return res.status(400).json({ message: "كلمة المرور غير متطابقة" });
//     }
    
//     // 4. Check for email conflicts
//     const emailExist = await User.findOne({ email });
//     if (emailExist) {
//         return res.status(400).json({ message: "البريد الإلكتروني مستخدم مسبقا" });
//     }
    
//     // 5. Check for phone conflicts (if phone is provided)
//     if (phone) {
//         const phoneExist = await User.findOne({ phone });
//         if (phoneExist) {
//             return res.status(400).json({ message: "رقم الهاتف مستخدم مسبقا" });
//         }
//     }
    
//     // 6. Set default profile picture based on role
//     let profilePicture = { secure_url: null, public_id: null };
    
//     // Determine default profile picture based on role
//     const defaultPicturePath = role === systemRoles.COMPANY 
//         ? '/default-images/company-default.png' 
//         : '/default-images/user-default.png';
    
//     // Set the full URL for the default profile picture
//     const baseUrl = `${req.protocol}://${req.headers.host}`;
//     profilePicture.secure_url = `${baseUrl}${defaultPicturePath}`;
//     profilePicture.public_id = `default-${role}-profile`; // Identifier for default images
    
//     // 7. Create the member instance
//     const member = new User({
//         email,
//         password,
//         username,
//         phone,
//         role,
//         governate,
//         profilePicture: profilePicture
//     });
    
//     // 8. Save the member to the database with rollback handling
//     try {
//         await member.save();
//     } catch (error) {
//         console.error("Couldn't Save The User To Database", error);
//         return next(new AppError("فشل في حفظ المستخدم", 500));
//     }
    
//     // 9. Send verification email
//     const token = jsonwebtoken.sign({ email }, process.env.JWT_SECRET, {
//         expiresIn: "1d",
//     });
    
//     const verificationUrl = `${req.protocol}://${req.headers.host}/members/verify-account?token=${token}`;
//     const emailMessage = `
//         <p>اذا سجلت بايميلك على Farm Mate يرجى الضغط على الرابط التالي لتفعيل حسابك:
//         <a href="${verificationUrl}">Verify your account</a></p>
//     `;
    
//     const emailSent = await sendEmail({
//         to: email,
//         subject: "فعل حسابك",
//         message: emailMessage,
//     });
    
//     if (!emailSent) {
//         // Rollback: Delete the member record from the database
//         try {
//             await User.findByIdAndDelete(member._id);
//         } catch (rollbackError) {
//             console.error("Failed to rollback after email send failure:", rollbackError);
//         }
//         return next(new AppError("Email could not be sent", 500));
//     }
    
//     // 10. Respond with success, excluding the password
//     const memberResponse = member.toObject();
//     delete memberResponse.password;
    
//     res.status(201).json({
//         message: "Member registered successfully, waiting on email confirmation",
//         member: memberResponse,
//     });
// });




// // VERIFY EMAIL
// export const verifyAccount = async (req, res, next) => {
//      // get data from req 
//      const {token} = req.query 
//      const decode = jsonwebtoken.verify(token,  process.env.JWT_SECRET)
//      if(!decode?.email){
//           return next(new AppError(messages.token.invalidToken,400))
//      }
//      const user = await User.findOneAndUpdate({email: decode.email,verifyEmail:false},{verifyEmail:true})
//      if(!user){
//           return next(new AppError(messages.user.NotFound,404))
//      }
//      return res.status(200).json({message:"تم تفعيل الحساب",success: true})
// }

// // SIGN IN
// export const signIn = async (req,res,next) => {

//     // get data from req
//     const {email,password} = req.body

//     // check existence
//     const user = await User.findOne({email , verifyEmail:true})
//     if (!user) {
//         return next(new AppError(messages.user.invalidCredentials),401)
//     }
//     // check password 
//     const match = bcrypt.compareSync(password, user.password)
//     if (!match) {
//         return next(new AppError(messages.user.invalidCredentials),401)
//     }

//     // update user status
//     user.status = status.ONLINE
//     await user.save()

//     // create token
//     const accessToken = jsonwebtoken.sign({_id: user._id},process.env.JWT_SECRET)
//     //send res
//     return res.status(200).json( {message:messages.user.signIn , success: true , data:accessToken})

// }

// // PUT EMAIL 

//     export const updateEmail = async (req, res, next) => {
//         // prepare user 
//         const {email} = req.body;
//         const user = await User.findOne({email})
//         // check existance 
//     if (!user) {
//         return next(new AppError(messages.user.invalidCredentials),401)
//     }
//     const createdUser = await User.findByIdAndUpdate

//     }