import axios from 'axios';
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authentication.js';

export const chatBotRouter = Router();


// Chatbot API configuration
const CHATBOT_API_URL = 'https://anabil111-plantbot.hf.space/chat';

// Chatbot service function
async function getChatbotResponse(userQuestion) {
  try {
    const response = await axios.post(CHATBOT_API_URL, {
      user_question: userQuestion
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout for AI responses
    });

    return {
      success: true,
      response: response.data.bot_response
    };
  } catch (error) {
    console.error('Chatbot API Error:', error.message);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Chatbot response timeout',
        message: 'عذراً، استغرق الرد وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى.'
      };
    }
    
    if (error.response) {
      return {
        success: false,
        error: 'Chatbot API error',
        status: error.response.status,
        message: 'حدث خطأ في الخدمة. يرجى المحاولة مرة أخرى لاحقاً.'
      };
    }
    
    return {
      success: false,
      error: 'Network error',
      message: 'تعذر الاتصال بالخدمة. يرجى التحقق من الاتصال بالإنترنت.'
    };
  }
}

// Chat endpoint for your mobile app
chatBotRouter.post('/chat', authenticateToken , async (req, res) => {
  try {
    const { message } = req.body;
    

    // Basic validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message',
        message: 'يرجى إدخال رسالة صحيحة'
      });
    }

    // // Optional: Log the conversation for analytics
    // console.log(`User ${userId || 'anonymous'} asked: ${message}`);

    // Get response from chatbot
    const result = await getChatbotResponse(message.trim());

    if (result.success) {
      // Optional: Log successful response
      console.log(`Bot responded: ${result.response.substring(0, 100)}...`);
      
      res.json({
        success: true,
        response: result.response,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'حدث خطأ داخلي. يرجى المحاولة مرة أخرى.'
    });
  }
});