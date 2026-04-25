"use strict";

/**
 * FinBuddy Application Logic
 * Integrates UI interaction, local storage state, Gemini AI, and Google Cloud Translation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        streakBadge: document.getElementById('streakBadge'),
        progressText: document.getElementById('progressText'),
        progressBar: document.getElementById('progressBar'),
        cardTitle: document.getElementById('cardTitle'),
        cardDescription: document.getElementById('cardDescription'),
        cardExample: document.getElementById('cardExample'),
        cardQuestion: document.getElementById('cardQuestion'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        markLearnedBtn: document.getElementById('markLearnedBtn'),
        learningCard: document.getElementById('learningCard'),
        principalInput: document.getElementById('principalInput'),
        rateInput: document.getElementById('rateInput'),
        calcBtn: document.getElementById('calcBtn'),
        calcResult: document.getElementById('calcResult'),
        aiTipBtn: document.getElementById('aiTipBtn'),
        aiTipContainer: document.getElementById('aiTipContainer'),
        languageSelector: document.getElementById('languageSelector')
    };

    // Application State
    let concepts = [];
    let originalConcepts = []; // always keeps English originals
    let currentIndex = 0;
    let learnedTopics = JSON.parse(localStorage.getItem('finBuddy_learned')) || [];
    let streak = parseInt(localStorage.getItem('finBuddy_streak')) || 0;
    let lastLogin = localStorage.getItem('finBuddy_lastLogin');
    let currentLanguage = 'en';

    // Translation cache: { 'hi': [{title, description, example, question}, ...] }
    const translationCache = {};

    /**
     * Initializes the application by fetching data and setting up UI.
     */
    async function init() {
        checkStreak();
        await fetchConcepts();
        updateUI();
        attachEventListeners();
        handleCalculate();
    }

    /**
     * Fetches finance concepts from local JSON data.
     */
    async function fetchConcepts() {
        try {
            const response = await fetch('data.json');
            originalConcepts = await response.json();
            concepts = originalConcepts;

            const firstUnlearned = concepts.findIndex(c => !learnedTopics.includes(c.id));
            currentIndex = firstUnlearned !== -1 ? firstUnlearned : 0;
        } catch (error) {
            console.error('Failed to load concepts:', error);
            elements.cardTitle.textContent = "Error loading content";
            elements.cardDescription.textContent = "Please make sure you are running this on a local server.";
        }
    }

    /**
     * Checks and updates the daily login streak.
     */
    function checkStreak() {
        const today = new Date().toDateString();
        if (lastLogin !== today) {
            if (lastLogin) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastLogin === yesterday.toDateString()) {
                    streak++;
                } else {
                    streak = 1;
                }
            } else {
                streak = 1;
            }
            localStorage.setItem('finBuddy_streak', streak);
            localStorage.setItem('finBuddy_lastLogin', today);
        }
    }

    /**
     * Updates all UI components based on current state.
     */
    function updateUI() {
        if (!concepts.length) return;

        const concept = concepts[currentIndex];
        const isLearned = learnedTopics.includes(concept.id);

        elements.learningCard.style.opacity = '0';

        setTimeout(() => {
            elements.cardTitle.textContent = concept.title;
            elements.cardDescription.textContent = concept.description;
            elements.cardExample.textContent = concept.example;
            elements.cardQuestion.textContent = concept.question;

            if (isLearned) {
                elements.markLearnedBtn.innerHTML = 'Learned <span aria-hidden="true">✅</span>';
                elements.markLearnedBtn.classList.add('learned');
            } else {
                elements.markLearnedBtn.innerHTML = 'Mark as Learned <span aria-hidden="true">✅</span>';
                elements.markLearnedBtn.classList.remove('learned');
            }

            elements.learningCard.style.opacity = '1';
        }, 300);

        const progressPercentage = window.calculateProgress(learnedTopics.length, concepts.length);
        elements.progressText.textContent = `You've learned ${learnedTopics.length}/${concepts.length} topics`;
        elements.progressBar.style.width = `${progressPercentage}%`;
        elements.streakBadge.innerHTML = `<span aria-hidden="true">🔥</span> ${streak}-day streak!`;
        elements.prevBtn.disabled = currentIndex === 0;
        elements.nextBtn.disabled = currentIndex === concepts.length - 1;
        elements.aiTipContainer.style.display = 'none';
        elements.aiTipContainer.textContent = '';
    }

    /**
     * Handles language selection change.
     * Uses a local cache to avoid redundant API calls.
     * @param {string} lang - Target language code (e.g., 'hi', 'es')
     */
    async function handleLanguageChange(lang) {
        currentLanguage = lang;

        if (lang === 'en') {
            // Restore English originals instantly - no API needed
            concepts = originalConcepts;
            updateUI();
            return;
        }

        // Serve from cache if available
        if (translationCache[lang]) {
            concepts = translationCache[lang];
            updateUI();
            return;
        }

        // Show loading state on the card
        elements.cardTitle.textContent = '🌐 Translating...';
        elements.cardDescription.textContent = '';
        elements.cardExample.textContent = '';
        elements.cardQuestion.textContent = '';

        try {
            // Flatten all texts to translate in one batched request
            const textsToTranslate = originalConcepts.flatMap(c => [
                c.title, c.description, c.example, c.question
            ]);

            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: textsToTranslate, targetLanguage: lang })
            });

            const data = await response.json();

            if (response.ok) {
                // Reconstruct the concepts array from the flat translations array
                const translated = [];
                for (let i = 0; i < originalConcepts.length; i++) {
                    translated.push({
                        id: originalConcepts[i].id,
                        title: data.translations[i * 4],
                        description: data.translations[i * 4 + 1],
                        example: data.translations[i * 4 + 2],
                        question: data.translations[i * 4 + 3]
                    });
                }

                // Store in cache for future use
                translationCache[lang] = translated;
                concepts = translated;
            } else {
                console.error('Translation error:', data.error);
                concepts = originalConcepts; // Fallback to English
            }
        } catch (error) {
            console.error('Translation request failed:', error);
            concepts = originalConcepts;
        }

        updateUI();
    }

    /**
     * Fetches a smart finance tip from the backend Gemini API.
     */
    async function getSmartTip() {
        if (!concepts.length) return;
        const currentTopic = originalConcepts[currentIndex].title; // Always use English topic for Gemini

        elements.aiTipContainer.style.display = 'block';
        elements.aiTipContainer.textContent = '🧠 Analyzing with AI...';

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: currentTopic })
            });

            const data = await response.json();

            if (response.ok) {
                elements.aiTipContainer.innerHTML = `<strong>💡 AI Tip:</strong> ${data.tip}`;
            } else {
                elements.aiTipContainer.textContent = `Error: ${data.error}`;
            }
        } catch (error) {
            elements.aiTipContainer.textContent = 'Oops! Could not connect to AI service.';
        }
    }

    /**
     * Handles the calculation logic for compound interest.
     */
    function handleCalculate() {
        const p = parseFloat(elements.principalInput.value) || 0;
        const r = parseFloat(elements.rateInput.value) || 0;

        const amount = window.calculateCompoundInterestAmount(p, r, 10);
        elements.calcResult.innerHTML = `After 10 years, you'll have: <strong>₹${amount.toFixed(2)}</strong>`;

        elements.calcResult.style.transform = 'scale(1.05)';
        setTimeout(() => {
            elements.calcResult.style.transform = 'scale(1)';
        }, 200);
    }

    /**
     * Attaches all DOM event listeners.
     */
    function attachEventListeners() {
        elements.prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) { currentIndex--; updateUI(); }
        });

        elements.nextBtn.addEventListener('click', () => {
            if (currentIndex < concepts.length - 1) { currentIndex++; updateUI(); }
        });

        elements.markLearnedBtn.addEventListener('click', () => {
            const concept = concepts[currentIndex];
            if (!learnedTopics.includes(concept.id)) {
                learnedTopics.push(concept.id);
                localStorage.setItem('finBuddy_learned', JSON.stringify(learnedTopics));

                elements.markLearnedBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    elements.markLearnedBtn.style.transform = 'scale(1)';
                    updateUI();
                }, 150);
            }
        });

        elements.calcBtn.addEventListener('click', handleCalculate);
        elements.principalInput.addEventListener('input', handleCalculate);
        elements.rateInput.addEventListener('input', handleCalculate);
        elements.aiTipBtn.addEventListener('click', getSmartTip);

        // Language selector change event
        elements.languageSelector.addEventListener('change', (e) => {
            handleLanguageChange(e.target.value);
        });
    }

    // Start App
    init();
});
