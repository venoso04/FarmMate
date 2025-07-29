import express from 'express';
import path from 'path';
import cors from 'cors';

import { connectDB } from './db/connection.js'
// import { authRouter } from './src/modules/auth/auth.router.js';
import { globalErrorHandling } from './src/middleware/asyncHandler.js';
import { fileURLToPath } from 'url';
import { diseaseDetectorRouter } from './src/modules/disease-detector/disease-detector.router.js';
import { authRouter } from './src/modules/authh/auth.router.js';
import { weatherRouter } from './src/modules/weather/weather.api.js';
import { chatBotRouter } from './src/modules/chatBot/chatBot.controller.js';


const app = express()
export const port = 3001

// connect to mongo
connectDB()

//PARSE REQUEST
app.use(express.json())

// use routerss

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is up and running!' });
});



app.use('/api/auth',authRouter)
app.use('/api/disease-detection', diseaseDetectorRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/chatbot', chatBotRouter);

// //page not found
// app.all("*", (req, res, next) => {
//   return next(new Error("page not found", { cause: 404 }));
// });


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'page not found' });
});

// use GLobal Error Handler
app.use(globalErrorHandling)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from default-images directory
app.use('/default-images', express.static(path.join(__dirname, 'default-images')));


// app.listen(port, () => {
//   console.log(`🌱 Farm Mate server running on port ${port}`);
// });

// Ping route to confirm the server is running
app.get("/ping", (req, res) => {
  res.send("Server is alive!");
});

app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

// app.listen(port, '0.0.0.0', () => {
//   console.log(`🌱 Farm Mate server running on port ${port}`);
// });


app.listen(port, '0.0.0.0', () => {
  console.log(`🌱 Farm Mate server running on port ${port}`);
  console.log(`📱 Local access: http://localhost:${port}`);
  console.log(`🌐 Network access: http://192.168.1.2:${port}`);
});

