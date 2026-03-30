import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Beef, CheckCircle2, GraduationCap } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

import { storage } from '../services/storage';

const lsGet = (key, fallback = null) => storage.getObject(key, fallback);

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Card({ children, onClick, className = '', theme }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[2rem] p-5 border mb-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
    >
      {children}
    </div>
  );
}

export default function HomeScreen({ theme, accent, name, onNavigate }) {
  // Read current data from localStorage for dashboard display
  const tk = todayKey();
  const allTasks = lsGet('siuRoutineTasks', {});
  const todayTasks = allTasks[tk] || [];
  const nextTask = todayTasks.find(t => !t.done) || null;
  const completedTasks = todayTasks.filter(t => t.done).length;

  const allWorkouts = lsGet('siuRoutineWorkout', {});
  const todayWorkout = allWorkouts[tk] || null;

  const proteinTotal = parseInt(storage.getString('siuProteinTotal', '0'));
  const habitGoals = lsGet('siuHabitGoals', { water: 8, protein: 150, steps: 10000, sleep: 7 });

  const lectures = lsGet('siuCollegeLectures', []);
  const todayDayName = DAY_NAMES[new Date().getDay()];
  const now = new Date();
  const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nextLecture = lectures
    .filter(l => l.day === todayDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .find(l => l.startTime > nowTimeStr) || null;

  const proteinPct = Math.min((proteinTotal / habitGoals.protein) * 100, 100);

  return (
    <motion.div
      key="home-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-6 pb-28 max-w-5xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-8 mt-4">
        <p
          className="text-[10px] font-normal uppercase tracking-[0.35em] mb-1"
          style={{ color: theme.textSecondary }}
        >
          Dashboard
        </p>
        <h2
          className="text-4xl font-semibold italic tracking-tight uppercase leading-none"
          style={{ color: theme.textPrimary }}
        >
          Yo, {name || 'Beast'}
        </h2>
      </div>

      {/* ── Today's Workout ── */}
      <Card theme={theme} onClick={() => onNavigate('workout')}>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={16} style={{ color: accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Today's Workout
          </span>
        </div>
        {todayWorkout ? (
          <p className="text-lg font-semibold" style={{ color: theme.textPrimary }}>{todayWorkout}</p>
        ) : (
          <p className="text-sm" style={{ color: theme.textSecondary }}>Rest Day — No workout planned</p>
        )}
      </Card>

      {/* ── Protein Progress ── */}
      <Card theme={theme} onClick={() => onNavigate('nutrition')}>
        <div className="flex items-center gap-2 mb-3">
          <Beef size={16} style={{ color: accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Protein Progress
          </span>
        </div>
        <div className="flex items-end justify-between mb-2">
          <p className="text-2xl font-semibold italic" style={{ color: theme.textPrimary }}>
            {proteinTotal}g
            <span className="text-sm font-normal" style={{ color: theme.textSecondary }}> / {habitGoals.protein}g</span>
          </p>
          <span className="text-xs font-medium" style={{ color: proteinPct >= 100 ? accent : theme.textSecondary }}>
            {Math.round(proteinPct)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: `${theme.textPrimary}10` }}>
          <motion.div
            animate={{ width: `${proteinPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: theme.progressBar }}
          />
        </div>
      </Card>

      {/* ── Next Task ── */}
      <Card theme={theme} onClick={() => onNavigate('routine')}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={16} style={{ color: accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Next Task
          </span>
          {todayTasks.length > 0 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${accent}15`, color: accent }}>
              {completedTasks}/{todayTasks.length}
            </span>
          )}
        </div>
        {nextTask ? (
          <div>
            <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{nextTask.title}</p>
            {nextTask.time && (
              <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: theme.textSecondary }}>
                ⏰ {nextTask.time}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {todayTasks.length > 0 ? 'All tasks completed ✓' : 'No tasks for today'}
          </p>
        )}
      </Card>

      {/* ── Next Lecture ── */}
      <Card theme={theme} onClick={() => onNavigate('college')}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} style={{ color: accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Next Lecture
          </span>
        </div>
        {nextLecture ? (
          <div>
            <p className="text-lg font-semibold" style={{ color: theme.textPrimary }}>{nextLecture.subject}</p>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: theme.textSecondary }}>
              {nextLecture.startTime} – {nextLecture.endTime} · {nextLecture.room || 'No room'}
            </p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: theme.textSecondary }}>No upcoming lectures today</p>
        )}
      </Card>
    </motion.div>
  );
}
