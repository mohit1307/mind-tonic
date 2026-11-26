const { timeToMinutes, minutesToTime, doTimesOverlap } = require('../utils/timeUtils');

/**
 * Constraint-Based Deterministic Scheduling Engine
 *
 * Discretizes a 24-hour day into 5-minute slots (288 slots).
 * Priority-aware, respects fixed commitments and user working/sleep windows.
 */

const TOTAL_SLOTS = 288; // 24 * 60 / 5
const MINUTES_PER_SLOT = 5;

// Priority weights
const PRIORITY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

class SchedulingEngine {
  /**
   * Main timetable generation function
   *
   * @param {Object} params
   * @param {Array} params.tasks - User's pending tasks (both fixed and flexible)
   * @param {Object} params.preferences - User's preferences (working hours, sleep schedule, break duration)
   * @param {Date} params.targetDate - Date for which schedule is generated
   * @returns {Array} List of schedule blocks
   */
  generateDailySchedule({ tasks = [], preferences = {}, targetDate = new Date() }) {
    // 1. Initialize empty timeline array (null means slot is free)
    // Each element will store block metadata if occupied
    const timeline = new Array(TOTAL_SLOTS).fill(null);

    const blocks = [];

    // Extract preferences with sensible defaults
    const sleepStart = preferences.sleepStart || '23:00';
    const sleepEnd = preferences.sleepEnd || '07:00';
    const workingStart = preferences.workingHoursStart || '09:00';
    const workingEnd = preferences.workingHoursEnd || '22:00';
    const breakDuration = preferences.breakDuration || 15;

    // 2. Lock Sleep Window
    const sleepBlock = this._lockSleepWindow(timeline, sleepStart, sleepEnd);
    if (sleepBlock) {
      blocks.push(sleepBlock);
    }

    // 3. Separate Fixed Commitments vs. Flexible Tasks
    const fixedTasks = [];
    const flexibleTasks = [];

    tasks.forEach((t) => {
      if (t.isFixed && t.fixedStartTime && t.fixedEndTime) {
        fixedTasks.push(t);
      } else {
        flexibleTasks.push(t);
      }
    });

    // 4. Lock Fixed Commitments (College, Labs, Fixed Meetings)
    fixedTasks.forEach((task) => {
      const block = this._lockFixedCommitment(timeline, task);
      if (block) {
        blocks.push(block);
      }
    });

    // 5. Sort Flexible Tasks by Priority Weight & Deadline Urgency
    const sortedFlexible = [...flexibleTasks].sort((a, b) => {
      // 1. Priority weight (descending)
      const weightA = PRIORITY_WEIGHTS[a.priority] || 2;
      const weightB = PRIORITY_WEIGHTS[b.priority] || 2;
      if (weightB !== weightA) return weightB - weightA;

      // 2. Deadline proximity (ascending)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;

      // 3. Duration (longer tasks first)
      return (b.estimatedDuration || 60) - (a.estimatedDuration || 60);
    });

    // 6. Slot Flexible Tasks into Available Windows
    const workStartMins = timeToMinutes(workingStart);
    const workEndMins = timeToMinutes(workingEnd);

    sortedFlexible.forEach((task) => {
      const durationMins = task.estimatedDuration || 60;
      const slotsNeeded = Math.ceil(durationMins / MINUTES_PER_SLOT);

      // Attempt 1: Within preferred working hours
      let assignedRange = this._findContiguousSlots(
        timeline,
        slotsNeeded,
        workStartMins,
        workEndMins
      );

      // Attempt 2: If working hours are packed, look across any non-sleep waking hours
      if (!assignedRange) {
        const sleepEndMins = timeToMinutes(sleepEnd);
        const sleepStartMins = timeToMinutes(sleepStart);
        assignedRange = this._findContiguousSlots(
          timeline,
          slotsNeeded,
          sleepEndMins,
          sleepStartMins
        );
      }

      if (assignedRange) {
        const { startSlot, endSlot } = assignedRange;
        const startTimeStr = minutesToTime(startSlot * MINUTES_PER_SLOT);
        const endTimeStr = minutesToTime((endSlot + 1) * MINUTES_PER_SLOT);

        const scheduledBlock = {
          taskId: task._id,
          title: task.title,
          startTime: startTimeStr,
          endTime: endTimeStr,
          type: 'flexible',
          status: 'scheduled',
          priority: task.priority || 'medium',
          category: task.category || 'personal',
        };

        // Occupy slots
        for (let i = startSlot; i <= endSlot; i++) {
          timeline[i] = scheduledBlock;
        }
        blocks.push(scheduledBlock);

        // 7. Insert Rest Break after heavy task (>= 45 mins) if space is available
        if (durationMins >= 45 && breakDuration > 0) {
          const breakSlotsNeeded = Math.ceil(breakDuration / MINUTES_PER_SLOT);
          const breakStartSlot = endSlot + 1;
          const breakEndSlot = breakStartSlot + breakSlotsNeeded - 1;

          if (this._areSlotsAvailable(timeline, breakStartSlot, breakEndSlot)) {
            const breakBlock = {
              title: 'Recharge & Rest Break',
              startTime: minutesToTime(breakStartSlot * MINUTES_PER_SLOT),
              endTime: minutesToTime((breakEndSlot + 1) * MINUTES_PER_SLOT),
              type: 'break',
              status: 'scheduled',
              priority: 'low',
              category: 'health',
            };
            for (let b = breakStartSlot; b <= breakEndSlot; b++) {
              timeline[b] = breakBlock;
            }
            blocks.push(breakBlock);
          }
        }
      }
    });

    // 8. Sort final blocks chronologically by start time
    blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    return blocks;
  }

  /**
   * Lock sleep hours on timeline
   */
  _lockSleepWindow(timeline, sleepStart, sleepEnd) {
    const startMins = timeToMinutes(sleepStart);
    const endMins = timeToMinutes(sleepEnd);

    const sleepBlock = {
      title: 'Rest & Sleep Window',
      startTime: sleepStart,
      endTime: sleepEnd,
      type: 'sleep',
      status: 'scheduled',
      priority: 'critical',
      category: 'health',
    };

    if (startMins > endMins) {
      // Overnight sleep (e.g. 23:00 to 07:00)
      const startSlot1 = Math.floor(startMins / MINUTES_PER_SLOT);
      const endSlot1 = TOTAL_SLOTS - 1;
      for (let i = startSlot1; i <= endSlot1; i++) timeline[i] = sleepBlock;

      const startSlot2 = 0;
      const endSlot2 = Math.floor(endMins / MINUTES_PER_SLOT) - 1;
      for (let i = startSlot2; i <= endSlot2; i++) timeline[i] = sleepBlock;
    } else {
      const startSlot = Math.floor(startMins / MINUTES_PER_SLOT);
      const endSlot = Math.floor(endMins / MINUTES_PER_SLOT) - 1;
      for (let i = startSlot; i <= endSlot; i++) timeline[i] = sleepBlock;
    }

    return sleepBlock;
  }

  /**
   * Lock fixed commitments into the timeline
   */
  _lockFixedCommitment(timeline, task) {
    const startMins = timeToMinutes(task.fixedStartTime);
    const endMins = timeToMinutes(task.fixedEndTime);

    if (endMins <= startMins) return null;

    const startSlot = Math.floor(startMins / MINUTES_PER_SLOT);
    const endSlot = Math.floor(endMins / MINUTES_PER_SLOT) - 1;

    const block = {
      taskId: task._id,
      title: task.title,
      startTime: task.fixedStartTime,
      endTime: task.fixedEndTime,
      type: 'fixed',
      status: 'scheduled',
      priority: task.priority || 'high',
      category: task.category || 'work',
    };

    for (let i = startSlot; i <= endSlot && i < TOTAL_SLOTS; i++) {
      timeline[i] = block;
    }

    return block;
  }

  /**
   * Find contiguous free slots within given minute window
   */
  _findContiguousSlots(timeline, slotsNeeded, minMinute, maxMinute) {
    const minSlot = Math.floor(minMinute / MINUTES_PER_SLOT);
    const maxSlot = Math.floor(maxMinute / MINUTES_PER_SLOT) - 1;

    let consecutive = 0;
    let candidateStart = -1;

    for (let i = minSlot; i <= maxSlot && i < TOTAL_SLOTS; i++) {
      if (timeline[i] === null) {
        if (consecutive === 0) candidateStart = i;
        consecutive++;
        if (consecutive === slotsNeeded) {
          return { startSlot: candidateStart, endSlot: i };
        }
      } else {
        consecutive = 0;
        candidateStart = -1;
      }
    }

    return null;
  }

  /**
   * Check if a slot range is available
   */
  _areSlotsAvailable(timeline, startSlot, endSlot) {
    if (startSlot < 0 || endSlot >= TOTAL_SLOTS || startSlot > endSlot) return false;
    for (let i = startSlot; i <= endSlot; i++) {
      if (timeline[i] !== null) return false;
    }
    return true;
  }

  /**
   * Find multiple ranked alternative slots for a missed task/session
   *
   * @param {Object} options
   * @param {Array} options.blocks - Existing blocks in today's schedule
   * @param {Object} options.preferences - User's working hours, sleep schedule
   * @param {Number} options.durationMins - Duration of the task in minutes
   * @param {String} options.fromTimeStr - "HH:MM" start scanning point
   * @param {String} [options.excludeBlockId] - Block ID being rescheduled
   * @param {Number} [options.limit=3] - Number of candidate suggestions
   * @returns {Array} List of alternative slots: [{ startTime, endTime, durationMins, label }]
   */
  findMultipleAlternativeSlots({
    blocks = [],
    preferences = {},
    durationMins = 60,
    fromTimeStr = '09:00',
    excludeBlockId = null,
    limit = 3,
  }) {
    // 1. Initialize timeline array
    const timeline = new Array(TOTAL_SLOTS).fill(null);

    const sleepStart = preferences.sleepStart || '23:00';
    const sleepEnd = preferences.sleepEnd || '07:00';
    const workingEnd = preferences.workingHoursEnd || '22:00';

    // 2. Lock sleep window
    this._lockSleepWindow(timeline, sleepStart, sleepEnd);

    // 3. Lock existing scheduled blocks (excluding the missed block itself)
    blocks.forEach((b) => {
      if (excludeBlockId && b._id && b._id.toString() === excludeBlockId.toString()) {
        return; // Don't block the slot of the task we are moving!
      }
      if (b.type === 'sleep') return; // already locked

      const sMins = timeToMinutes(b.startTime);
      const eMins = timeToMinutes(b.endTime);
      if (eMins > sMins) {
        const sSlot = Math.floor(sMins / MINUTES_PER_SLOT);
        const eSlot = Math.floor(eMins / MINUTES_PER_SLOT) - 1;
        for (let i = sSlot; i <= eSlot && i < TOTAL_SLOTS; i++) {
          timeline[i] = b;
        }
      }
    });

    // 4. Scan starting from fromTimeStr up to sleepStart
    const startScanMins = Math.max(timeToMinutes(fromTimeStr), timeToMinutes(sleepEnd));
    const maxScanMins = timeToMinutes(sleepStart);
    const slotsNeeded = Math.ceil(durationMins / MINUTES_PER_SLOT);

    const suggestions = [];
    const minSlot = Math.floor(startScanMins / MINUTES_PER_SLOT);
    const maxSlot = Math.floor(maxScanMins / MINUTES_PER_SLOT) - 1;

    let consecutive = 0;
    let candidateStart = -1;

    for (let i = minSlot; i <= maxSlot && i < TOTAL_SLOTS; i++) {
      if (timeline[i] === null) {
        if (consecutive === 0) candidateStart = i;
        consecutive++;

        if (consecutive === slotsNeeded) {
          const sTime = minutesToTime(candidateStart * MINUTES_PER_SLOT);
          const eTime = minutesToTime((i + 1) * MINUTES_PER_SLOT);

          const isWithinWorkingHours = timeToMinutes(eTime) <= timeToMinutes(workingEnd);

          suggestions.push({
            startTime: sTime,
            endTime: eTime,
            durationMins,
            isWithinWorkingHours,
            label: isWithinWorkingHours
              ? `${sTime} - ${eTime} (Working Hours)`
              : `${sTime} - ${eTime} (Evening Hours)`,
          });

          if (suggestions.length >= limit) break;

          // Reset search and jump forward by at least 15 mins to give spaced alternatives
          i += Math.floor(15 / MINUTES_PER_SLOT);
          consecutive = 0;
          candidateStart = -1;
        }
      } else {
        consecutive = 0;
        candidateStart = -1;
      }
    }

    return suggestions;
  }

  /**
   * Check whether a proposed time slot is completely free without collisions
   */
  isSlotFree(timeline, startTimeStr, endTimeStr) {
    const sMins = timeToMinutes(startTimeStr);
    const eMins = timeToMinutes(endTimeStr);
    const sSlot = Math.floor(sMins / MINUTES_PER_SLOT);
    const eSlot = Math.floor(eMins / MINUTES_PER_SLOT) - 1;
    return this._areSlotsAvailable(timeline, sSlot, eSlot);
  }
}

module.exports = new SchedulingEngine();
