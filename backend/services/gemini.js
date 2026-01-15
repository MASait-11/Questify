/*
 * Gemini AI Service
 * This service handles all AI text generation using Google's Gemini API.
 * Used for generating encouragement messages, nudges, quotes, and alerts.
 * Requires GEMINI_API_KEY in .env file.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI message based on type and context
 * @param {string} type - Message type: 'completion', 'nudge', 'failure_alert', 'dashboard_quote'
 * @param {object} context - Context data like goal_type, user_name, etc.
 * @returns {Promise<string>} Generated message text
 */
async function generateMessage(type, context = {}) {
  // Get the Gemini model
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Define prompts for different message types
  const prompts = {
    'completion': `Generate a short, enthusiastic 1-sentence congratulations for completing a ${context.goal_type || 'personal'} goal. Make it fun and encouraging!`,
    
    'nudge': `Generate a friendly, encouraging 1-sentence nudge to motivate someone to work on their "${context.goal_title || 'goal'}" goal in the "${context.goal_type || 'personal'}" category. Be supportive but motivating. Only respond with the nudge message, nothing else.`,
    
    'failure_alert': `Generate a constructive, motivating 1-sentence message for someone who is behind on their ${context.goal_type || 'personal'} goal. Be empathetic but encouraging.`,
    
    'dashboard_quote': `Generate an inspiring 1-sentence motivational quote about achieving goals and self-improvement. Make it powerful and memorable. Only respond with the quote, nothing else.`,
    
    'badge_unlock': `Generate a celebratory 1-sentence message for unlocking the "${context.badge_name}" achievement. Make it exciting!`
  };
  
  try {
    console.log(`[Gemini] Generating ${type} message with context:`, context);
    console.log(`[Gemini] API Key present: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`[Gemini] API Key length: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0}`);
    
    // Generate content using Gemini with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
    );
    
    const generatePromise = model.generateContent(prompts[type] || prompts['dashboard_quote']);
    const result = await Promise.race([generatePromise, timeoutPromise]);
    
    if (!result || !result.response) {
      throw new Error('No response from Gemini API');
    }
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    
    console.log(`[Gemini] Successfully generated ${type} message:`, text);
    
    // Clean up the response (remove quotes and asterisks if present)
    return text.replace(/^[\*"'\s]+|[\*"'\s]+$/g, '').trim();
  } catch (error) {
    console.error(`[Gemini] Error generating ${type} message:`, error.message || error);
    console.error(`[Gemini] Full error:`, error);
    
    // Generate varied fallback messages based on type and context
    if (type === 'dashboard_quote') {
      const quotes = [
        'Success is the sum of small efforts repeated day in and day out.',
        'The only way to do great work is to love what you do.',
        'Believe you can and you\'re halfway there.',
        'It always seems impossible until it\'s done.',
        'Your limitation is only your imagination.',
        'Don\'t watch the clock; do what it does. Keep going.',
        'The future belongs to those who believe in the beauty of their dreams.',
        'Strive for progress, not perfection.',
        'Great things never came from comfort zones.',
        'Your potential is endless.'
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    } else if (type === 'nudge') {
      const categoryUpper = (context.goal_type || 'your goal').charAt(0).toUpperCase() + (context.goal_type || 'your goal').slice(1);
      const nudges = [
        `${categoryUpper} is calling! Get after it today! 💪`,
        `Don't let today slip by - crush your ${context.goal_type || 'goal'} goal! 🚀`,
        `You've got the power to make progress today. Let's go! ⚡`,
        `Every step counts. Make your ${context.goal_type || 'goal'} happen! 🎯`,
        `This is your moment to shine. Go for your goal! ✨`,
        `Keep the momentum going - your future self will thank you! 🙌`,
        `You're capable of amazing things. Let's start with this goal! 💫`,
        `Make today count. Your ${context.goal_type || 'goal'} is waiting for you! 🔥`
      ];
      return nudges[Math.floor(Math.random() * nudges.length)];
    } else if (type === 'completion') {
      const completions = [
        'That\'s the spirit! You\'re crushing it! 🎉',
        'Absolutely amazing work! Keep this momentum going! 🚀',
        'You did it! That\'s what I\'m talking about! 💪',
        'Fantastic job! You\'re unstoppable! ⭐',
        'You nailed it! Keep up the incredible work! 🔥'
      ];
      return completions[Math.floor(Math.random() * completions.length)];
    }
    
    // Default fallbacks
    const fallbacks = {
      'completion': 'Great job completing your task! Keep up the amazing work! 🎉',
      'nudge': `Keep pushing on your goal! You've got this! 💪`,
      'failure_alert': 'You\'re a bit behind, but it\'s never too late to catch up. Let\'s do this!',
      'dashboard_quote': 'Success is the sum of small efforts repeated day in and day out.',
      'badge_unlock': 'Congratulations on unlocking a new achievement! 🏆'
    };
    
    return fallbacks[type] || fallbacks['dashboard_quote'];
  }
}

module.exports = { generateMessage };