const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { Translate } = require('@google-cloud/translate').v2;

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middleware (Helmet)
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

// API Route: Get Smart Finance Tip (Google Gemini)
app.post('/api/gemini', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
            return res.status(500).json({ error: "Gemini API Key is missing! Please add it to your .env file." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { topic } = req.body;
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

// API Route: Translate content (Google Cloud Translation API)
app.post('/api/translate', async (req, res) => {
    try {
        if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
            return res.status(500).json({ error: "Google Translate API Key is missing! Add GOOGLE_TRANSLATE_API_KEY to your .env file." });
        }

        const { texts, targetLanguage } = req.body;

        // Input validation
        if (!texts || !Array.isArray(texts) || !targetLanguage) {
            return res.status(400).json({ error: "Invalid input. Provide 'texts' (array) and 'targetLanguage'." });
        }

        // Sanitize inputs
        const safeTexts = texts.map(t => String(t).trim().substring(0, 500));
        const safeLang = String(targetLanguage).trim().substring(0, 5);

        // Initialize Google Cloud Translate client with API key
        const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });

        // Translate all texts in parallel for efficiency
        const translations = await Promise.all(
            safeTexts.map(async (text) => {
                const [translated] = await translate.translate(text, safeLang);
                return translated;
            })
        );

        res.json({ translations });
    } catch (error) {
        console.error("Translation API Error:", error);
        res.status(500).json({ error: "Failed to translate content. Make sure GOOGLE_TRANSLATE_API_KEY is valid." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 FinBuddy Server running on http://localhost:${PORT}`);
});
