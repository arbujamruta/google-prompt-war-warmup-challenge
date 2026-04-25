# FinBuddy - Your Tiny Finance Learning Companion 🚀

FinBuddy is a minimal, creative web app that helps you learn basic finance concepts in a fun and interactive way, while also tracking your learning progress. It behaves like a friendly guide that teaches 1 small finance concept at a time.

## ✨ Features
- **Daily Learning Card**: Clean UI showing 1 bite-sized finance concept at a time with a title, explanation, example, and a reflection question.
- **Mark as Learned ✅**: Keep track of topics you've read. Progress is saved locally in your browser!
- **Progress Tracker 📊**: A visual progress bar updating in real-time as you learn.
- **Streak Element 🔥**: Tracks your daily streak to keep you motivated.
- **Interactive Calculator**: A tiny compound interest calculator to see the magic of compounding!

## 🛠️ Tech Stack
- Frontend: Vanilla HTML, CSS, JavaScript
- Backend: None (Uses `localStorage` for progress tracking)
- Deployment: Docker + Google Cloud Run

## 🚀 How to Run Locally

### Option 1: Using a simple local server
If you have Node.js installed or Python:
1. Clone the repository or navigate to this folder.
2. Run a local web server, for example:
   - Using Python: `python -m http.server 8000`
   - Using Node.js: `npx serve .`
3. Open `http://localhost:8000` or the URL provided in your terminal.

*(Note: Simply double-clicking `index.html` will not work perfectly because the `fetch('data.json')` call requires a server to avoid CORS issues).*

### Option 2: Using Docker (Recommended to match production)
1. Build the Docker image:
   ```bash
   docker build -t finbuddy-app .
   ```
2. Run the container:
   ```bash
   docker run -p 8080:8080 finbuddy-app
   ```
3. Open `http://localhost:8080` in your browser.

## ☁️ Deployment to Google Cloud Run

1. Make sure you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated.
2. Set your Google Cloud project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Build and deploy the container in one step using Cloud Build and Cloud Run:
   ```bash
   gcloud run deploy finbuddy --source . --port 8080 --allow-unauthenticated
   ```
4. Once deployed, the CLI will output a public URL (e.g., `https://finbuddy-xxxxx-uc.a.run.app`). Visit this URL to use FinBuddy live!

---

*"Hi, I'm FinBuddy 👋 Let's grow your money mindset!"*
