const { calculateCompoundInterestAmount, calculateProgress } = require('../public/utils.js');

describe('FinBuddy Utilities', () => {
    
    describe('calculateCompoundInterestAmount', () => {
        test('calculates correct interest over 10 years at 10%', () => {
            const amount = calculateCompoundInterestAmount(1000, 10, 10);
            expect(amount).toBeCloseTo(2593.74, 2);
        });

        test('returns 0 for negative principal', () => {
            const amount = calculateCompoundInterestAmount(-100, 10, 10);
            expect(amount).toBe(0);
        });

        test('handles 0% interest correctly', () => {
            const amount = calculateCompoundInterestAmount(1000, 0, 10);
            expect(amount).toBe(1000);
        });
    });

    describe('calculateProgress', () => {
        test('calculates 50% when 4 out of 8 are learned', () => {
            const progress = calculateProgress(4, 8);
            expect(progress).toBe(50);
        });

        test('returns 0 when total topics is 0', () => {
            const progress = calculateProgress(0, 0);
            expect(progress).toBe(0);
        });

        test('caps at 100% when learned exceeds total', () => {
            const progress = calculateProgress(10, 8);
            expect(progress).toBe(100);
        });
    });
});
