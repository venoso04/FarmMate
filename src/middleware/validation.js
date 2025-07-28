import { AppError } from "../utils/common/appError.js"
// import joi from 'joi'
// import { gender } from "../utils/common/enum.js"


// export const generalValidation ={
//      username: joi.string().min(3).max(20),
//      email:joi.string(),
//      password:joi.string().pattern(new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!#.])[A-Za-z\\d$@$!%*?&.]{8,20}'))
//      ,
//      rePassword:joi.valid(joi.ref('password')),
//      gender:joi.string().valid(...Object.values(gender)),
//      age: joi.number().integer().min(15).max(100)
// }

export const validation = (schema) => {
     return (req, res, next) => {
       let data = { ...req.params, ...req.body, ...req.query };
       const { error } = schema.validate(data, { abortEarly: false });
   
       if (error) {
         const errorArr = error.details.map(detail => detail.message); // Map each error detail to its message
   
         return next(new AppError(errorArr, 400));
       }
       next();
     };
   };
   