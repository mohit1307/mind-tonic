import { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  BarChart2,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  Brain,
  History,
} from 'lucide-react';
import useLearning from '../hooks/useLearning';
import LearningStats from '../components/learning/LearningStats';
import SubjectCard from '../components/learning/SubjectCard';
import SubjectModal from '../components/learning/SubjectModal';
import TopicModal from '../components/learning/TopicModal';
import StudyTimerModal from '../components/learning/StudyTimerModal';
import SpacedReviewCard from '../components/learning/SpacedReviewCard';
import LearningAnalyticsChart from '../components/learning/LearningAnalyticsChart';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';

const TABS = [
  { id: 'subjects', label: 'Subjects & Syllabus', icon: BookOpen },
  { id: 'reviews', label: 'Spaced Repetition', icon: Brain, badgeKey: 'dueCount' },
  { id: 'analytics', label: 'Study Analytics & History', icon: BarChart2 },
];

export default function Learning() {
  const {
    subjects,
    dueReviews,
    stats,
    sessions,
    loading,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    submitReview,
    logStudySession,
  } = useLearning();

  const [activeTab, setActiveTab] = useState('subjects');

  // Modals state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState(null);

  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerSubjectId, setTimerSubjectId] = useState(null);

  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Handle open timer for specific subject
  const handleOpenTimer = (subjectId = null) => {
    setTimerSubjectId(subjectId);
    setTimerModalOpen(true);
  };

  // Handle open topic modal
  const handleOpenAddTopic = (subject) => {
    setSelectedSubjectForTopic(subject);
    setTopicModalOpen(true);
  };

  // Handle edit subject
  const handleOpenEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectModalOpen(true);
  };

  // Handle topic completion toggle
  const handleToggleTopicComplete = async (subjectId, topicId, isCompleted) => {
    await updateTopic(subjectId, topicId, { isCompleted });
  };

  // Handle rating active recall review
  const handleRateReview = async (subjectId, topicId, quality) => {
    try {
      const res = await submitReview(subjectId, topicId, quality);
      setReviewSuccessMsg(res.message || 'Review recorded successfully');
      setTimeout(() => setReviewSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Learning & Spaced Repetition
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track course syllabi, measure study hours with a focus stopwatch, and retain concepts with the SM-2 algorithm.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={Play}
            size="sm"
            onClick={() => handleOpenTimer()}
            disabled={subjects.length === 0}
          >
            Focus Timer
          </Button>

          <Button
            icon={Plus}
            size="sm"
            onClick={() => {
              setEditingSubject(null);
              setSubjectModalOpen(true);
            }}
          >
            Add Subject
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <LearningStats stats={stats} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeVal = tab.badgeKey === 'dueCount' ? dueReviews.count : null;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all
                ${
                  isActive
                    ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40 shadow-glow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}

              {badgeVal !== null && badgeVal > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-2xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {badgeVal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm">
          {error}
        </div>
      )}

      {/* Success banner for review submission */}
      {reviewSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-success-500/15 border border-success-500/30 text-success-300 text-xs flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>{reviewSuccessMsg}</span>
        </div>
      )}

      {/* Tab 1: Subjects & Syllabus */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader size="lg" />
              <p className="text-sm text-slate-400 mt-3 animate-pulse-soft">
                Loading subjects & syllabus...
              </p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto text-accent-400 shadow-glow-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Subjects Added Yet</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Add your college subjects or self-study tracks (e.g. Java, System Design, Algorithms) to organize topics and start timed focus blocks.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingSubject(null);
                  setSubjectModalOpen(true);
                }}
                icon={Plus}
                size="lg"
              >
                Add Your First Subject
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {subjects.map((subj) => (
                <SubjectCard
                  key={subj._id}
                  subject={subj}
                  onStartTimer={handleOpenTimer}
                  onAddTopic={handleOpenAddTopic}
                  onEditSubject={handleOpenEditSubject}
                  onDeleteSubject={deleteSubject}
                  onToggleTopicComplete={handleToggleTopicComplete}
                  onDeleteTopic={deleteTopic}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Spaced Repetition Active Recall */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                SuperMemo SM-2 Active Recall Engine
              </h3>
              <p className="text-xs text-slate-400">
                Topics are scheduled based on your recall rating. Higher ratings push the next review further out (1 day → 6 days → 16+ days).
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              {dueReviews.count} in queue today
            </span>
          </div>

          {dueReviews.count === 0 ? (
            <div className="glass-card p-12 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-success-500/10 border border-success-500/20 flex items-center justify-center mx-auto text-success-400 shadow-glow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
                <p className="text-sm text-slate-400">
                  You have reviewed all active recall cards due for today. Great job keeping your memory retention peak!
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('subjects')}
              >
                Explore Syllabus
              </Button>
            </div>
          ) : (
            <SpacedReviewCard
              topic={dueReviews.topics[0]}
              onRate={handleRateReview}
              loading={loading}
            />
          )}
        </div>
      )}

      {/* Tab 3: Study Analytics & History */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <LearningAnalyticsChart stats={stats} />

          {/* Recent Study Sessions Table */}
          <Card className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-accent-400" />
              Recent Logged Focus Sessions
            </h4>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No focus sessions logged yet.
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((ses) => (
                  <div
                    key={ses._id}
                    className="p-3 rounded-xl bg-surface-light/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ses.subjectId?.color || '#6366f1' }}
                      />
                      <div>
                        <span className="font-semibold text-white">
                          {ses.subjectId?.name || 'Subject'}
                        </span>
                        {ses.topicName && (
                          <span className="text-slate-400 ml-1.5">• {ses.topicName}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400">
                      <span>{new Date(ses.createdAt || ses.date).toLocaleDateString()}</span>
                      <span className="font-bold text-accent-300">
                        {ses.durationMinutes} mins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSave={async (data) => {
          if (editingSubject) {
            await updateSubject(editingSubject._id, data);
          } else {
            await createSubject(data);
          }
        }}
        subject={editingSubject}
      />

      <TopicModal
        isOpen={topicModalOpen}
        onClose={() => {
          setTopicModalOpen(false);
          setSelectedSubjectForTopic(null);
        }}
        onSave={async (data) => {
          if (selectedSubjectForTopic) {
            await addTopic(selectedSubjectForTopic._id, data);
          }
        }}
        subject={selectedSubjectForTopic}
      />

      <StudyTimerModal
        isOpen={timerModalOpen}
        onClose={() => {
          setTimerModalOpen(false);
          setTimerSubjectId(null);
        }}
        subjects={subjects}
        initialSubjectId={timerSubjectId}
        onSaveSession={logStudySession}
      />
    </div>
  );
}
