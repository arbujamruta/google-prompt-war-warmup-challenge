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
        // Calculator elements
        principalInput: document.getElementById('principalInput'),
        rateInput: document.getElementById('rateInput'),
        calcBtn: document.getElementById('calcBtn'),
        calcResult: document.getElementById('calcResult')
    };

    // State
    let concepts = [];
    let currentIndex = 0;
    let learnedTopics = JSON.parse(localStorage.getItem('finBuddy_learned')) || [];
    let streak = parseInt(localStorage.getItem('finBuddy_streak')) || 0;
    let lastLogin = localStorage.getItem('finBuddy_lastLogin');

    // Initialize App
    async function init() {
        checkStreak();
        await fetchConcepts();
        updateUI();
        attachEventListeners();
        calculateCompoundInterest(); // initial calc
    }

    // Fetch data
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

    // Check and update streak
    function checkStreak() {
        const today = new Date().toDateString();
        if (lastLogin !== today) {
            if (lastLogin) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastLogin === yesterday.toDateString()) {
                    // Logged in yesterday, streak continues!
                    streak++;
                } else {
                    // Streak broken
                    streak = 1;
                }
            } else {
                // First login ever
                streak = 1;
            }
            localStorage.setItem('finBuddy_streak', streak);
            localStorage.setItem('finBuddy_lastLogin', today);
        }
    }

    // Update the entire UI
    function updateUI() {
        if (!concepts.length) return;

        const concept = concepts[currentIndex];
        const isLearned = learnedTopics.includes(concept.id);

        // Update card content with fade effect
        elements.learningCard.style.opacity = '0';
        
        setTimeout(() => {
            elements.cardTitle.textContent = concept.title;
            elements.cardDescription.textContent = concept.description;
            elements.cardExample.textContent = concept.example;
            elements.cardQuestion.textContent = concept.question;
            
            // Update learned button state
            if (isLearned) {
                elements.markLearnedBtn.textContent = 'Learned ✅';
                elements.markLearnedBtn.classList.add('learned');
            } else {
                elements.markLearnedBtn.textContent = 'Mark as Learned ✅';
                elements.markLearnedBtn.classList.remove('learned');
            }

            elements.learningCard.style.opacity = '1';
        }, 300);

        // Update progress
        const learnedCount = learnedTopics.length;
        const totalCount = concepts.length;
        const progressPercentage = (learnedCount / totalCount) * 100;
        
        elements.progressText.textContent = `You've learned ${learnedCount}/${totalCount} topics`;
        elements.progressBar.style.width = `${progressPercentage}%`;

        // Update streak
        elements.streakBadge.textContent = `🔥 ${streak}-day streak!`;

        // Update navigation buttons
        elements.prevBtn.disabled = currentIndex === 0;
        elements.nextBtn.disabled = currentIndex === concepts.length - 1;
    }

    // Event Listeners
    function attachEventListeners() {
        elements.prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateUI();
            }
        });

        elements.nextBtn.addEventListener('click', () => {
            if (currentIndex < concepts.length - 1) {
                currentIndex++;
                updateUI();
            }
        });

        elements.markLearnedBtn.addEventListener('click', () => {
            const concept = concepts[currentIndex];
            if (!learnedTopics.includes(concept.id)) {
                learnedTopics.push(concept.id);
                localStorage.setItem('finBuddy_learned', JSON.stringify(learnedTopics));
                
                // Add a small bounce animation
                elements.markLearnedBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    elements.markLearnedBtn.style.transform = 'scale(1)';
                    updateUI();
                }, 150);
            }
        });

        // Calculator event listeners
        elements.calcBtn.addEventListener('click', calculateCompoundInterest);
        elements.principalInput.addEventListener('input', calculateCompoundInterest);
        elements.rateInput.addEventListener('input', calculateCompoundInterest);
    }

    function calculateCompoundInterest() {
        const p = parseFloat(elements.principalInput.value) || 0;
        const r = parseFloat(elements.rateInput.value) || 0;
        const t = 10; // Fixed 10 years for simplicity
        
        // A = P(1 + r/n)^(nt) - assuming annual compounding (n=1)
        const amount = p * Math.pow(1 + (r / 100), t);
        
        elements.calcResult.innerHTML = `After 10 years, you'll have: <strong>₹${amount.toFixed(2)}</strong>`;
        
        // Small pop animation
        elements.calcResult.style.transform = 'scale(1.05)';
        setTimeout(() => {
            elements.calcResult.style.transform = 'scale(1)';
        }, 200);
    }

    // Start
    init();
});
