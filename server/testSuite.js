/**
 * Comprehensive Backend Automated Test Suite for Mind Tonic
 * Tests engines, utilities, database query wrappers, and route handlers.
 */
const { timeToMinutes, minutesToTime, doTimesOverlap, normalizeDate } = require('./utils/timeUtils');
const schedulerEngine = require('./engines/scheduler');
const spacedRepetitionEngine = require('./engines/spacedRepetition');
const ocrProcessor = require('./utils/ocrProcessor');
const { testSupabaseConnection } = require('./config/supabase');
const { supabaseDb } = require('./db/supabaseDb');
const ApiError = require('./utils/apiError');
const apiResponse = require('./utils/apiResponse');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`✅ PASSED: ${testName}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Mind Tonic Automated Test Suite...\n');

  // ── 1. Test timeUtils ──────────────────────────────────────────────
  assert(timeToMinutes('00:00') === 0, 'timeToMinutes("00:00") === 0');
  assert(timeToMinutes('09:30') === 570, 'timeToMinutes("09:30") === 570');
  assert(timeToMinutes('23:59') === 1439, 'timeToMinutes("23:59") === 1439');
  assert(minutesToTime(570) === '09:30', 'minutesToTime(570) === "09:30"');
  assert(minutesToTime(0) === '00:00', 'minutesToTime(0) === "00:00"');
  assert(doTimesOverlap('09:00', '11:00', '10:00', '12:00') === true, 'doTimesOverlap detects collision');
  assert(doTimesOverlap('09:00', '10:00', '10:00', '11:00') === false, 'doTimesOverlap adjacent slots do not collide');

  // ── 2. Test Scheduler Engine (288-Slot Constraint Solver) ──────────
  const mockTasks = [
    {
      id: 'task-1',
      title: 'College Lectures',
      category: 'college',
      priority: 'high',
      isFixed: true,
      fixedStartTime: '09:00',
      fixedEndTime: '16:00',
    },
    {
      id: 'task-2',
      title: 'Study Java Programming',
      category: 'study',
      priority: 'high',
      isFixed: false,
      estimatedDuration: 120, // 2 hours
    },
    {
      id: 'task-3',
      title: 'Gym Workout',
      category: 'health',
      priority: 'medium',
      isFixed: false,
      estimatedDuration: 60, // 1 hour
    },
  ];

  const mockPrefs = {
    workingHoursStart: '09:00',
    workingHoursEnd: '22:00',
    sleepStart: '23:00',
    sleepEnd: '07:00',
    breakDuration: 15,
  };

  const schedule = schedulerEngine.generateDailySchedule({
    tasks: mockTasks,
    preferences: mockPrefs,
    targetDate: new Date(),
  });

  assert(Array.isArray(schedule), 'Scheduler returns an array of blocks');
  assert(schedule.length >= 3, 'Scheduler created multiple schedule blocks');

  // Verify fixed commitment (09:00 - 16:00) is locked and intact
  const fixedCollegeBlock = schedule.find((b) => b.title === 'College Lectures');
  assert(!!fixedCollegeBlock, 'Fixed college block is present in schedule');
  assert(fixedCollegeBlock.startTime === '09:00' && fixedCollegeBlock.endTime === '16:00', 'College hours are strictly preserved (09:00 - 16:00)');

  // Verify no flexible tasks overlap with the fixed college window
  const collegeStart = timeToMinutes('09:00');
  const collegeEnd = timeToMinutes('16:00');

  const overlappingFlexible = schedule.find((b) => {
    if (b.title === 'College Lectures' || b.type === 'sleep') return false;
    const s = timeToMinutes(b.startTime);
    const e = timeToMinutes(b.endTime);
    return Math.max(s, collegeStart) < Math.min(e, collegeEnd);
  });
  assert(!overlappingFlexible, 'Zero flexible task collisions with fixed college hours (09:00-16:00)');

  // ── 3. Test SuperMemo SM-2 Spaced Repetition Engine ─────────────────
  const sm2Initial = spacedRepetitionEngine.calculateNextReview({
    quality: 5,
    repetitions: 0,
    easinessFactor: 2.5,
    interval: 1,
  });
  assert(sm2Initial.repetitions === 1, 'SM-2 repetition counter increments on success');
  assert(sm2Initial.interval === 1, 'First SM-2 interval is 1 day');
  assert(sm2Initial.easinessFactor >= 2.5, 'Easiness factor preserved or increased on quality=5');

  const sm2Second = spacedRepetitionEngine.calculateNextReview({
    quality: 4,
    repetitions: 1,
    easinessFactor: sm2Initial.easinessFactor,
    interval: sm2Initial.interval,
  });
  assert(sm2Second.repetitions === 2, 'SM-2 repetition counter is 2');
  assert(sm2Second.interval === 6, 'Second SM-2 interval is 6 days');

  const sm2Fail = spacedRepetitionEngine.calculateNextReview({
    quality: 1,
    repetitions: 2,
    easinessFactor: 2.5,
    interval: 6,
  });
  assert(sm2Fail.repetitions === 0, 'SM-2 resets repetitions on recall failure (quality < 3)');
  assert(sm2Fail.interval === 1, 'SM-2 resets interval to 1 day on failure');

  // ── 4. Test Live Supabase Connectivity ──────────────────────────────
  const conn = await testSupabaseConnection();
  assert(conn.connected === true, 'Supabase live PostgreSQL endpoint is reachable');

  // ── 5. Test Express App and Route Trees ─────────────────────────────
  const app = require('./app');
  assert(typeof app === 'function', 'Express app instance loads cleanly');

  // ── 6. Test Services instantiation ──────────────────────────────────
  const taskService = require('./services/task.service');
  const scheduleService = require('./services/schedule.service');
  const habitService = require('./services/habit.service');
  const learningService = require('./services/learning.service');
  const documentService = require('./services/document.service');
  const expenseService = require('./services/expense.service');
  const notificationService = require('./services/notification.service');
  const analyticsService = require('./services/analytics.service');
  const aiService = require('./services/ai.service');
  const adminController = require('./controllers/admin.controller');

  assert(typeof taskService.createTask === 'function', 'TaskService.createTask is defined');
  assert(typeof scheduleService.generateSchedule === 'function', 'ScheduleService.generateSchedule is defined');
  assert(typeof habitService.toggleHabitLog === 'function', 'HabitService.toggleHabitLog is defined');
  assert(typeof learningService.reviewTopic === 'function', 'LearningService.reviewTopic is defined');
  assert(typeof documentService.uploadDocument === 'function', 'DocumentService.uploadDocument is defined');
  assert(typeof expenseService.createFromOCR === 'function', 'ExpenseService.createFromOCR is defined');
  assert(typeof notificationService.createNotification === 'function', 'NotificationService.createNotification is defined');
  assert(typeof notificationService.clearAll === 'function', 'NotificationService.clearAll is defined');
  assert(typeof analyticsService.getAnalyticsOverview === 'function', 'AnalyticsService.getAnalyticsOverview is defined');
  assert(typeof aiService.processMessage === 'function', 'AIService.processMessage is defined');
  assert(typeof adminController.getOverview === 'function', 'AdminController.getOverview is defined');
  assert(typeof adminController.updateUserStatus === 'function', 'AdminController.updateUserStatus is defined');

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY!\n`);
}

runTests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
