const { supabaseDb } = require('../db/supabaseDb');
const spacedRepetitionEngine = require('../engines/spacedRepetition');
const ApiError = require('../utils/apiError');
const { normalizeDate } = require('../utils/timeUtils');

function mapTopicToApi(t) {
  if (!t) return null;
  return {
    _id: t.id,
    id: t.id,
    subjectId: t.subject_id,
    name: t.topic_name,
    topicName: t.topic_name,
    repetitions: t.repetitions || 0,
    interval: t.interval || 1,
    easinessFactor: Number(t.easiness_factor) || 2.5,
    nextReviewDate: t.next_review_date,
    confidence: t.confidence >= 4 ? 'high' : t.confidence >= 2 ? 'medium' : 'low',
    confidenceRating: t.confidence || 3,
    lastReviewedAt: t.last_reviewed_at,
    isCompleted: (t.repetitions || 0) >= 1,
  };
}

function mapSubjectToApi(s, topics = []) {
  if (!s) return null;
  const mappedTopics = topics.map(mapTopicToApi);
  const totalTopics = mappedTopics.length;
  const completedTopics = mappedTopics.filter((t) => t.isCompleted).length;
  const masteredTopics = mappedTopics.filter((t) => t.confidence === 'high' && t.repetitions >= 2).length;
  const dueCount = mappedTopics.filter((t) => spacedRepetitionEngine.isDueForReview(t.nextReviewDate)).length;

  const targetMinutes = (s.target_hours || 40) * 60;
  const totalStudyMinutes = s.total_study_minutes || 0;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const hoursProgressPercent = targetMinutes > 0 ? Math.min(100, Math.round((totalStudyMinutes / targetMinutes) * 100)) : 0;

  return {
    _id: s.id,
    id: s.id,
    userId: s.user_id,
    name: s.name,
    code: s.code || '',
    color: s.color || '#8B5CF6',
    icon: s.icon || 'BookOpen',
    targetHours: s.target_hours || 40,
    totalStudyMinutes,
    topics: mappedTopics,
    stats: {
      totalTopics,
      completedTopics,
      masteredTopics,
      dueCount,
      progressPercent,
      hoursProgressPercent,
      totalStudyHours: Number((totalStudyMinutes / 60).toFixed(1)),
    },
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

class LearningService {
  /**
   * Get all subjects for a user with calculated progress stats
   */
  async getSubjects(userId) {
    const { data: subjects } = await supabaseDb.client
      .from('study_subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!subjects || subjects.length === 0) return [];

    const subjectIds = subjects.map((s) => s.id);
    const { data: allTopics } = await supabaseDb.client
      .from('revision_schedules')
      .select('*')
      .in('subject_id', subjectIds);

    const topicsBySubject = {};
    (allTopics || []).forEach((t) => {
      if (!topicsBySubject[t.subject_id]) topicsBySubject[t.subject_id] = [];
      topicsBySubject[t.subject_id].push(t);
    });

    return subjects.map((s) => mapSubjectToApi(s, topicsBySubject[s.id] || []));
  }

  /**
   * Get single subject with its topics
   */
  async getSubjectById(userId, subjectId) {
    const subject = await supabaseDb.findById('study_subjects', subjectId, userId);
    if (!subject) throw ApiError.notFound('Subject not found');

    const { data: topics } = await supabaseDb.client
      .from('revision_schedules')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true });

    return mapSubjectToApi(subject, topics || []);
  }

  /**
   * Create a new Subject
   */
  async createSubject(userId, data) {
    const row = {
      user_id: userId,
      name: data.name.trim(),
      code: data.code || '',
      color: data.color || '#8B5CF6',
      icon: data.icon || 'BookOpen',
      target_hours: data.targetHours ? Number(data.targetHours) : 40,
      total_study_minutes: 0,
    };

    const created = await supabaseDb.insert('study_subjects', row);
    return mapSubjectToApi(created, []);
  }

  /**
   * Update Subject
   */
  async updateSubject(userId, subjectId, data) {
    const subject = await supabaseDb.findById('study_subjects', subjectId, userId);
    if (!subject) throw ApiError.notFound('Subject not found');

    const updates = {};
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.code !== undefined) updates.code = data.code;
    if (data.color !== undefined) updates.color = data.color;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.targetHours !== undefined) updates.target_hours = Number(data.targetHours);

    const updated = await supabaseDb.update('study_subjects', { id: subjectId, user_id: userId }, updates);
    return this.getSubjectById(userId, subjectId);
  }

  /**
   * Delete Subject and cascade topics
   */
  async deleteSubject(userId, subjectId) {
    const subject = await supabaseDb.findById('study_subjects', subjectId, userId);
    if (!subject) throw ApiError.notFound('Subject not found');

    await supabaseDb.delete('study_subjects', { id: subjectId, user_id: userId });
    return { message: 'Subject deleted successfully' };
  }

  /**
   * Add a Topic to a Subject
   */
  async addTopic(userId, subjectId, data) {
    const subject = await supabaseDb.findById('study_subjects', subjectId, userId);
    if (!subject) throw ApiError.notFound('Subject not found');

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);

    const topicRow = {
      user_id: userId,
      subject_id: subjectId,
      topic_name: data.name?.trim() || data.topicName?.trim() || 'New Topic',
      repetitions: 0,
      interval: 1,
      easiness_factor: 2.5,
      next_review_date: nextDate.toISOString().split('T')[0],
      confidence: 3,
    };

    const created = await supabaseDb.insert('revision_schedules', topicRow);
    return mapTopicToApi(created);
  }

  /**
   * Update a Topic
   */
  async updateTopic(userId, subjectId, topicId, data) {
    const topic = await supabaseDb.findById('revision_schedules', topicId, userId);
    if (!topic || topic.subject_id !== subjectId) throw ApiError.notFound('Topic not found');

    const updates = {};
    if (data.name !== undefined) updates.topic_name = data.name.trim();
    if (data.topicName !== undefined) updates.topic_name = data.topicName.trim();
    if (data.confidence !== undefined) updates.confidence = Number(data.confidence) || 3;

    const updated = await supabaseDb.update('revision_schedules', { id: topicId }, updates);
    return mapTopicToApi(updated?.[0] || { ...topic, ...updates });
  }

  /**
   * Delete a Topic
   */
  async deleteTopic(userId, subjectId, topicId) {
    const topic = await supabaseDb.findById('revision_schedules', topicId, userId);
    if (!topic || topic.subject_id !== subjectId) throw ApiError.notFound('Topic not found');

    await supabaseDb.delete('revision_schedules', { id: topicId, user_id: userId });
    return { message: 'Topic deleted successfully' };
  }

  /**
   * Record an active recall review with SM-2 Spaced Repetition rating (0 to 5)
   */
  async reviewTopic(userId, subjectId, topicId, qualityRating) {
    const topic = await supabaseDb.findById('revision_schedules', topicId, userId);
    if (!topic || topic.subject_id !== subjectId) throw ApiError.notFound('Topic not found');

    // Run pure SM-2 algorithm
    const result = spacedRepetitionEngine.calculateNextReview({
      quality: qualityRating,
      repetitions: topic.repetitions || 0,
      easinessFactor: Number(topic.easiness_factor) || 2.5,
      interval: topic.interval || 1,
    });

    const nextDateStr = result.nextReviewDate instanceof Date
      ? result.nextReviewDate.toISOString().split('T')[0]
      : String(result.nextReviewDate).split('T')[0];

    const updates = {
      repetitions: result.repetitions,
      interval: result.interval,
      easiness_factor: result.easinessFactor,
      next_review_date: nextDateStr,
      confidence: qualityRating,
      last_reviewed_at: new Date().toISOString(),
    };

    const updated = await supabaseDb.update('revision_schedules', { id: topicId }, updates);
    const updatedTopic = mapTopicToApi(updated?.[0] || { ...topic, ...updates });

    return {
      message: `Review recorded. Next review scheduled in ${result.interval} day(s).`,
      topic: updatedTopic,
      sm2Result: result,
    };
  }

  /**
   * Get all active recall review cards due today across all subjects
   */
  async getDueReviews(userId) {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data: topics } = await supabaseDb.client
      .from('revision_schedules')
      .select('*, study_subjects(name, color, code)')
      .eq('user_id', userId)
      .lte('next_review_date', todayStr);

    const dueTopics = (topics || []).map((t) => ({
      subjectId: t.subject_id,
      subjectName: t.study_subjects?.name || 'Subject',
      subjectColor: t.study_subjects?.color || '#8B5CF6',
      subjectCode: t.study_subjects?.code || '',
      topicId: t.id,
      name: t.topic_name,
      repetitions: t.repetitions,
      easinessFactor: t.easiness_factor,
      interval: t.interval,
      lastReviewedAt: t.last_reviewed_at,
      nextReviewDate: t.next_review_date,
      confidence: t.confidence >= 4 ? 'high' : t.confidence >= 2 ? 'medium' : 'low',
    }));

    return {
      count: dueTopics.length,
      topics: dueTopics,
    };
  }

  /**
   * Log a study session and increment total study minutes on the subject
   */
  async logStudySession(userId, data) {
    const subject = await supabaseDb.findById('study_subjects', data.subjectId, userId);
    if (!subject) throw ApiError.notFound('Subject not found');

    const durationMinutes = Number(data.durationMinutes) || 30;
    const dateStr = (data.date ? new Date(data.date) : new Date()).toISOString().split('T')[0];

    const sessionRow = {
      user_id: userId,
      subject_id: data.subjectId,
      topic_name: data.topicName || '',
      duration_minutes: durationMinutes,
      focus_rating: Number(data.focusRating) || 4,
      notes: data.notes || '',
      date: dateStr,
    };

    const session = await supabaseDb.insert('study_sessions', sessionRow);

    // Increment total minutes on Subject
    const currentMins = subject.total_study_minutes || 0;
    await supabaseDb.update(
      'study_subjects',
      { id: data.subjectId },
      { total_study_minutes: currentMins + durationMinutes }
    );

    return {
      _id: session.id,
      id: session.id,
      userId: session.user_id,
      subjectId: session.subject_id,
      topicName: session.topic_name,
      durationMinutes: session.duration_minutes,
      focusRating: session.focus_rating,
      notes: session.notes,
      date: session.date,
      createdAt: session.created_at,
    };
  }

  /**
   * Get recent study sessions history
   */
  async getStudySessions(userId, { limit = 20, subjectId = null } = {}) {
    let q = supabaseDb.client
      .from('study_sessions')
      .select('*, study_subjects(name, color, code)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (subjectId) {
      q = q.eq('subject_id', subjectId);
    }

    const { data: sessions } = await q;

    return (sessions || []).map((s) => ({
      _id: s.id,
      id: s.id,
      userId: s.user_id,
      subjectId: s.subject_id,
      subject: s.study_subjects,
      topicName: s.topic_name,
      durationMinutes: s.duration_minutes,
      focusRating: s.focus_rating,
      notes: s.notes,
      date: s.date,
      createdAt: s.created_at,
    }));
  }

  /**
   * Get aggregated learning analytics
   */
  async getLearningStats(userId) {
    const subjects = await this.getSubjects(userId);
    const { count: sessionCount } = await supabaseDb.client
      .from('study_sessions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    let totalStudyMinutes = 0;
    let totalTopics = 0;
    let completedTopics = 0;
    let masteredTopics = 0;
    let dueCount = 0;
    const subjectBreakdown = [];

    subjects.forEach((s) => {
      totalStudyMinutes += s.totalStudyMinutes || 0;
      totalTopics += s.topics.length;
      completedTopics += s.stats.completedTopics;
      masteredTopics += s.stats.masteredTopics;
      dueCount += s.stats.dueCount;

      subjectBreakdown.push({
        subjectId: s.id,
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
      recentSessionsCount: sessionCount || 0,
    };
  }
}

module.exports = new LearningService();
