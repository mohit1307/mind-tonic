const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');
const spacedRepetitionEngine = require('../engines/spacedRepetition');
const ApiError = require('../utils/apiError');
const { normalizeDate } = require('../utils/timeUtils');

class LearningService {
  /**
   * Get all subjects for a user with calculated progress stats
   */
  async getSubjects(userId) {
    const subjects = await Subject.find({ userId }).sort({ createdAt: -1 });

    return subjects.map((subj) => {
      const totalTopics = subj.topics.length;
      const completedTopics = subj.topics.filter((t) => t.isCompleted).length;
      const masteredTopics = subj.topics.filter(
        (t) => t.confidence === 'high' && t.repetitions >= 2
      ).length;
      const dueCount = subj.topics.filter((t) =>
        spacedRepetitionEngine.isDueForReview(t.nextReviewDate)
      ).length;

      const progressPercent =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
      const targetMinutes = (subj.targetHours || 0) * 60;
      const hoursProgressPercent =
        targetMinutes > 0
          ? Math.min(100, Math.round((subj.totalStudyMinutes / targetMinutes) * 100))
          : 0;

      return {
        ...subj.toObject(),
        stats: {
          totalTopics,
          completedTopics,
          masteredTopics,
          dueCount,
          progressPercent,
          hoursProgressPercent,
          totalStudyHours: Number((subj.totalStudyMinutes / 60).toFixed(1)),
        },
      };
    });
  }

  /**
   * Get single subject with its topics
   */
  async getSubjectById(userId, subjectId) {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    const totalTopics = subject.topics.length;
    const completedTopics = subject.topics.filter((t) => t.isCompleted).length;
    const dueCount = subject.topics.filter((t) =>
      spacedRepetitionEngine.isDueForReview(t.nextReviewDate)
    ).length;

    return {
      ...subject.toObject(),
      stats: {
        totalTopics,
        completedTopics,
        dueCount,
        progressPercent:
          totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
        totalStudyHours: Number((subject.totalStudyMinutes / 60).toFixed(1)),
      },
    };
  }

  /**
   * Create a new Subject
   */
  async createSubject(userId, data) {
    const existing = await Subject.findOne({ userId, name: data.name.trim() });
    if (existing) {
      throw ApiError.conflict(`Subject with name "${data.name}" already exists`);
    }

    const subject = await Subject.create({
      userId,
      ...data,
      name: data.name.trim(),
    });

    return subject;
  }

  /**
   * Update an existing Subject
   */
  async updateSubject(userId, subjectId, data) {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    if (data.name && data.name.trim() !== subject.name) {
      const existing = await Subject.findOne({
        userId,
        name: data.name.trim(),
        _id: { $ne: subjectId },
      });
      if (existing) {
        throw ApiError.conflict(`Subject with name "${data.name}" already exists`);
      }
      subject.name = data.name.trim();
    }

    if (data.code !== undefined) subject.code = data.code;
    if (data.description !== undefined) subject.description = data.description;
    if (data.color !== undefined) subject.color = data.color;
    if (data.icon !== undefined) subject.icon = data.icon;
    if (data.targetHours !== undefined) subject.targetHours = data.targetHours;

    await subject.save();
    return subject;
  }

  /**
   * Delete a Subject and its associated sessions
   */
  async deleteSubject(userId, subjectId) {
    const subject = await Subject.findOneAndDelete({ _id: subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    await StudySession.deleteMany({ userId, subjectId });
    return { message: 'Subject and study history deleted successfully' };
  }

  /**
   * Add a Topic to a Subject
   */
  async addTopic(userId, subjectId, data) {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    const newTopic = {
      name: data.name.trim(),
      notes: data.notes || '',
      difficulty: data.difficulty || 'medium',
      confidence: data.confidence || 'low',
      isCompleted: data.isCompleted || false,
      repetitions: 0,
      interval: 1,
      easinessFactor: 2.5,
      lastReviewedAt: null,
      nextReviewDate: new Date(), // Due immediately for initial learning
    };

    subject.topics.push(newTopic);
    await subject.save();

    const added = subject.topics[subject.topics.length - 1];
    return added;
  }

  /**
   * Update a Topic
   */
  async updateTopic(userId, subjectId, topicId, data) {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    const topic = subject.topics.id(topicId);
    if (!topic) throw ApiError.notFound('Topic not found');

    if (data.name !== undefined) topic.name = data.name.trim();
    if (data.notes !== undefined) topic.notes = data.notes;
    if (data.difficulty !== undefined) topic.difficulty = data.difficulty;
    if (data.confidence !== undefined) topic.confidence = data.confidence;
    if (data.isCompleted !== undefined) topic.isCompleted = data.isCompleted;

    await subject.save();
    return topic;
  }

  /**
   * Delete a Topic
   */
  async deleteTopic(userId, subjectId, topicId) {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    const topic = subject.topics.id(topicId);
    if (!topic) throw ApiError.notFound('Topic not found');

    topic.deleteOne();
    await subject.save();
    return { message: 'Topic deleted successfully' };
  }

  /**
   * Record an active recall review with SM-2 Spaced Repetition rating (0 to 5)
   */
  async reviewTopic(userId, subjectId, topicId, qualityRating) {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    const topic = subject.topics.id(topicId);
    if (!topic) throw ApiError.notFound('Topic not found');

    // Run SM-2 calculation
    const result = spacedRepetitionEngine.calculateNextReview({
      quality: qualityRating,
      repetitions: topic.repetitions,
      easinessFactor: topic.easinessFactor,
      interval: topic.interval,
    });

    // Update topic with new SM-2 values
    topic.repetitions = result.repetitions;
    topic.interval = result.interval;
    topic.easinessFactor = result.easinessFactor;
    topic.nextReviewDate = result.nextReviewDate;
    topic.confidence = result.confidence;
    topic.lastReviewedAt = new Date();

    // If rated 4 or 5 and completed was false, mark completed
    if (qualityRating >= 4) {
      topic.isCompleted = true;
    }

    await subject.save();

    return {
      message: `Review recorded. Next review scheduled in ${result.interval} day(s).`,
      topic,
      sm2Result: result,
    };
  }

  /**
   * Get all active recall review cards due today across all subjects
   */
  async getDueReviews(userId) {
    const subjects = await Subject.find({ userId });
    const dueTopics = [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    subjects.forEach((subj) => {
      subj.topics.forEach((t) => {
        if (!t.nextReviewDate || new Date(t.nextReviewDate) <= today) {
          dueTopics.push({
            subjectId: subj._id,
            subjectName: subj.name,
            subjectColor: subj.color,
            subjectCode: subj.code,
            topicId: t._id,
            name: t.name,
            notes: t.notes,
            difficulty: t.difficulty,
            confidence: t.confidence,
            repetitions: t.repetitions,
            easinessFactor: t.easinessFactor,
            interval: t.interval,
            lastReviewedAt: t.lastReviewedAt,
            nextReviewDate: t.nextReviewDate,
          });
        }
      });
    });

    return {
      count: dueTopics.length,
      topics: dueTopics,
    };
  }

  /**
   * Log a study session and increment total study minutes on the subject
   */
  async logStudySession(userId, data) {
    const subject = await Subject.findOne({ _id: data.subjectId, userId });
    if (!subject) throw ApiError.notFound('Subject not found');

    let topicName = data.topicName || '';
    if (data.topicId) {
      const topic = subject.topics.id(data.topicId);
      if (topic) topicName = topic.name;
    }

    const session = await StudySession.create({
      userId,
      subjectId: subject._id,
      topicId: data.topicId || null,
      topicName,
      durationMinutes: data.durationMinutes,
      focusRating: data.focusRating || 4,
      notes: data.notes || '',
      date: normalizeDate(data.date || new Date()),
    });

    // Update total minutes on Subject
    subject.totalStudyMinutes += data.durationMinutes;
    await subject.save();

    return session;
  }

  /**
   * Get recent study sessions history
   */
  async getStudySessions(userId, { limit = 20, subjectId = null } = {}) {
    const query = { userId };
    if (subjectId) query.subjectId = subjectId;

    const sessions = await StudySession.find(query)
      .populate('subjectId', 'name color code')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return sessions;
  }

  /**
   * Get aggregated learning analytics
   */
  async getLearningStats(userId) {
    const [subjects, sessions] = await Promise.all([
      Subject.find({ userId }),
      StudySession.find({ userId }),
    ]);

    let totalStudyMinutes = 0;
    let totalTopics = 0;
    let completedTopics = 0;
    let masteredTopics = 0;
    let dueCount = 0;

    const subjectBreakdown = [];

    subjects.forEach((s) => {
      totalStudyMinutes += s.totalStudyMinutes || 0;
      totalTopics += s.topics.length;

      s.topics.forEach((t) => {
        if (t.isCompleted) completedTopics++;
        if (t.confidence === 'high' && t.repetitions >= 2) masteredTopics++;
        if (spacedRepetitionEngine.isDueForReview(t.nextReviewDate)) dueCount++;
      });

      subjectBreakdown.push({
        subjectId: s._id,
        name: s.name,
        color: s.color,
        hours: Number(((s.totalStudyMinutes || 0) / 60).toFixed(1)),
        topicsCount: s.topics.length,
      });
    });

    return {
      totalStudyHours: Number((totalStudyMinutes / 60).toFixed(1)),
      totalSubjects: subjects.length,
      totalTopics,
      completedTopics,
      masteredTopics,
      dueReviewsCount: dueCount,
      masteryRate: totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0,
      subjectBreakdown,
      recentSessionsCount: sessions.length,
    };
  }
}

module.exports = new LearningService();
