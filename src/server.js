const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middleware (Helmet)
// Customizing Content Security Policy to allow inline styles/scripts for this simple app
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
        }
    }
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Route: Get Smart Finance Tip
app.post('/api/gemini', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
            return res.status(500).json({ error: "Gemini API Key is missing! Please add it to your .env file." });
        }
        
        // Initialize Gemini Client here so the server doesn't crash on boot if the key is missing
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const { topic } = req.body;
        
        // Input sanitization/validation
        const safeTopic = topic ? String(topic).trim().substring(0, 100) : "general personal finance";
        
        const prompt = `Give me a very short, friendly, and practical 2-3 line financial tip about ${safeTopic}. Don't use markdown or complex formatting. Just a simple string.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ tip: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate tip. Make sure GEMINI_API_KEY is valid." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 FinBuddy Server running on http://localhost:${PORT}`);
});
