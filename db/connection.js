import mongoose from 'mongoose';

export const connectDB = async () =>{
     try {const conn = await mongoose.connect('mongodb://localhost:27017/Grad1');
     console.log('MongoDB connection established')}
     catch(error){
          console.log(error)
     }
}