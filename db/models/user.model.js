import { model, Schema } from 'mongoose';
import {systemRoles } from '../../src/utils/common/enum.js';

//schema 
const userSchema = new Schema({
     username:{
          type:String,
          required:true,

     },
     governate:{
     type:String,
     required:true,

     },
     email:{
          type: String,
          required: true,
          unique:true
     },
     password:{
          type: String,
          required:true,
          minlength: 8,
          validate: {
              validator: function(v) {
                  return /\d/.test(v);  // checks if the string contains at least one digit
              },
              message: props => `${props.value} must contain at least one number`
          }
     },

     verifyEmail:{
          type:Boolean,
          default:false
     },
     verificationToken: {
    type: String,
    default: undefined
},
     roles:{
          type:String,
          enum:Object.values(systemRoles), 
          default: systemRoles.USER
     },

//          profilePicture: {
//         secure_url: String,
//         public_id: String
//     }
     // projects:{ // array of project ids
     //      type:[Schema.Types.ObjectId],
     //      ref:'Project'

     // },

     // status:{
     //      type:String,
     //      enum:Object.values(status), 
     //      default:status.OFFLINE}
},{timestamps:true})
// model
export const User = model('User',userSchema)