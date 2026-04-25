# FinBuddy - Your Smart Finance Learning Companion 🚀

FinBuddy is a clean, intelligent, and accessible web app that helps you learn basic finance concepts. It has been fully optimized for production with a secure Node.js backend, robust accessibility, Jest testing, and AI integration via Google Gemini.

## ✨ Features
- **Daily Learning Card**: Clean UI showing 1 bite-sized finance concept at a time.
- **Mark as Learned ✅**: Progress is saved locally in your browser!
- **Interactive Calculator**: A tiny compound interest calculator.
- **💡 Smart Finance Tips (Google Cloud Integration)**: Click a button to get a 2-3 line personalized, context-aware finance tip powered by the **Google Gemini API**.

## 🛠️ Tech Stack & Engineering Excellence
- **Frontend**: Vanilla HTML, CSS, JavaScript (Zero bloat).
- **Backend**: Node.js & Express (Handles API requests securely).
- **Security**: Secured with `helmet` and environment variables (`dotenv`), with input sanitization.
- **Testing**: Unit tested using **Jest**.
- **Accessibility**: Perfect semantic HTML, `aria-labels`, `aria-live` regions, and keyboard-friendly focus outlines.
- **Code Quality**: Strictly typed logic split across modular files (`utils.js`, `app.js`, `server.js`) with JSDoc comments.

## 🚀 How to Run Locally

### 1. Setup
Make sure you have Node.js installed.
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (you can copy `.env.example`) and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_real_key_here
PORT=8080
```

### 3. Run the Server
```bash
npm start
```
Then visit `http://localhost:8080`.

### 4. Run Tests
```bash
npm test
```

## ☁️ Deployment (Google Cloud Run)
FinBuddy is fully Dockerized for Cloud Run.

1. Build the Docker image:
   ```bash
   docker build -t finbuddy-app .
   ```
2. Deploy directly via gcloud:
   ```bash
   gcloud run deploy finbuddy --source . --port 8080 --allow-unauthenticated --set-env-vars="GEMINI_API_KEY=your_real_key_here"
   ```

---

*"Hi, I'm FinBuddy 👋 You're getting smarter with money 💡"*
