"use strict";

/**
 * FinBuddy Application Logic
 * Integrates UI interaction, local storage state, and backend APIs.
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
        // Gemini Elements
        aiTipBtn: document.getElementById('aiTipBtn'),
        aiTipContainer: document.getElementById('aiTipContainer')
    };

    // Application State
    let concepts = [];
    let currentIndex = 0;
    let learnedTopics = JSON.parse(localStorage.getItem('finBuddy_learned')) || [];
    let streak = parseInt(localStorage.getItem('finBuddy_streak')) || 0;
    let lastLogin = localStorage.getItem('finBuddy_lastLogin');

    /**
     * Initializes the application by fetching data and setting up UI.
     */
    async function init() {
        checkStreak();
        await fetchConcepts();
        updateUI();
        attachEventListeners();
        handleCalculate(); // initial calc
    }

    /**
     * Fetches finance concepts from local JSON data.
     */
    async function fetchConcepts() {
        try {
            const response = await fetch('data.json');
            concepts = await response.json();
            
            // Default to first unlearned topic, or 0 if all learned
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
                    streak = 1; // Streak broken
                }
            } else {
                streak = 1; // First login
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

        // Uses global calculateProgress from utils.js
        const progressPercentage = window.calculateProgress(learnedTopics.length, concepts.length);
        
        elements.progressText.textContent = `You've learned ${learnedTopics.length}/${concepts.length} topics`;
        elements.progressBar.style.width = `${progressPercentage}%`;

        elements.streakBadge.innerHTML = `<span aria-hidden="true">🔥</span> ${streak}-day streak!`;

        elements.prevBtn.disabled = currentIndex === 0;
        elements.nextBtn.disabled = currentIndex === concepts.length - 1;
        
        // Hide AI tip when changing cards
        elements.aiTipContainer.style.display = 'none';
        elements.aiTipContainer.textContent = '';
    }

    /**
     * Fetches a smart finance tip from the backend Gemini API.
     */
    async function getSmartTip() {
        if (!concepts.length) return;
        const currentTopic = concepts[currentIndex].title;
        
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
        
        // Uses global calculateCompoundInterestAmount from utils.js
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
    }

    // Start App
    init();
});
