/**
 * SM-2 Spaced Repetition Algorithm Engine
 *
 * Implements the SuperMemo-2 (SM-2) algorithm used in Anki and modern active recall tools.
 * It computes the optimal review interval and Easiness Factor (EF) based on the user's
 * recall quality rating (0 to 5).
 */

class SpacedRepetitionEngine {
  /**
   * Calculate next review schedule based on SM-2
   *
   * @param {Object} params
   * @param {number} params.quality - Rating from 0 (blackout) to 5 (perfect recall)
   * @param {number} [params.repetitions=0] - Number of consecutive successful recalls
   * @param {number} [params.easinessFactor=2.5] - Current easiness factor (min 1.3)
   * @param {number} [params.interval=1] - Current interval in days
   * @returns {Object} { nextReviewDate, interval, repetitions, easinessFactor, confidence }
   */
  calculateNextReview({
    quality,
    repetitions = 0,
    easinessFactor = 2.5,
    interval = 1,
  }) {
    const q = Math.max(0, Math.min(5, Math.round(Number(quality) || 0)));
    let currentRep = Number(repetitions) || 0;
    let currentEF = Number(easinessFactor) || 2.5;
    let currentInterval = Number(interval) || 1;

    // 1. Calculate new Easiness Factor (EF)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    let newEF = currentEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEF < 1.3) newEF = 1.3;
    newEF = Number(newEF.toFixed(2));

    // 2. Calculate new repetitions and interval
    let nextInterval;
    let nextRepetitions;

    if (q < 3) {
      // Failed recall: reset repetitions to 0, schedule next review tomorrow
      nextRepetitions = 0;
      nextInterval = 1;
    } else {
      // Successful recall
      if (currentRep === 0) {
        nextInterval = 1;
      } else if (currentRep === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(currentInterval * newEF);
      }
      nextRepetitions = currentRep + 1;
    }

    // 3. Compute next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);
    nextDate.setHours(0, 0, 0, 0);

    // 4. Derive subjective confidence category
    let confidence = 'medium';
    if (q >= 4 && nextRepetitions >= 2) {
      confidence = 'high';
    } else if (q < 3) {
      confidence = 'low';
    }

    return {
      nextReviewDate: nextDate,
      interval: nextInterval,
      repetitions: nextRepetitions,
      easinessFactor: newEF,
      confidence,
    };
  }

  /**
   * Determine if a topic is due for review today or overdue
   *
   * @param {Date|string} nextReviewDate
   * @returns {boolean}
   */
  isDueForReview(nextReviewDate) {
    if (!nextReviewDate) return true; // Unreviewed topics are immediately due
    const reviewDate = new Date(nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return reviewDate <= today;
  }
}

module.exports = new SpacedRepetitionEngine();
