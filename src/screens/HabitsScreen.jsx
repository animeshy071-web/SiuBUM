import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Footprints, Moon, Flame, Zap } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

import { storage } from '../services/storage';

const lsGet = (key, fallback = null) => storage.getObject(key, fallback);
const lsSet = (key, val) => storage.setObject(key, val);

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function Card({ children, className = '', theme }) {
  return (
    <div
      className={`rounded-[2rem] p-5 border mb-4 ${className}`}
      style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
    >
      {children}
    </div>
  );
}

export default function HabitsScreen({ theme, accent }) {
  const sk = todayKey();

  // ── Habits state ──────────────────────────────────────────────────────
  const [allHabits, setAllHabits] = useState(() => lsGet('siuRoutineHabits', {}));
  const habits = allHabits[sk] || { water: 0, protein: 0, steps: 0, sleep: 0 };
  const habitGoals = lsGet('siuHabitGoals', { water: 8, protein: 150, steps: 10000, sleep: 7 });

  useEffect(() => { lsSet('siuRoutineHabits', allHabits); }, [allHabits]);

  const updateHabit = (habit, delta) => {
    setAllHabits(prev => {
      const current = prev[sk] || { water: 0, protein: 0, steps: 0, sleep: 0 };
      const newVal = Math.max(0, (current[habit] || 0) + delta);
      return { ...prev, [sk]: { ...current, [habit]: newVal } };
    });
  };

  // ── Streak calculation ────────────────────────────────────────────────
  const allWorkouts = lsGet('siuRoutineWorkout', {});
  const allTasks = lsGet('siuRoutineTasks', {});

  const calcStreak = useCallback((checkFn) => {
    let streak = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (true) {
      if (checkFn(dateKey(d))) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    if (checkFn(todayKey())) streak++;
    return streak;
  }, []);

  const workoutStreak = calcStreak(dk => !!allWorkouts[dk]);
  const taskStreak = calcStreak(dk => {
    const t = allTasks[dk];
    return t && t.length > 0 && t.every(task => task.done);
  });
  const proteinStreak = calcStreak(dk => {
    const h = allHabits[dk];
    return h && h.protein >= habitGoals.protein;
  });

  // ── Config for steps & sleep ──────────────────────────────────────────
  const HABIT_CONFIG = [
    { key: 'steps', label: 'Steps', icon: Footprints, unit: '', goal: habitGoals.steps, step: 500, quickLabel: '+500', color: '#4ade80' },
    { key: 'sleep', label: 'Sleep', icon: Moon, unit: 'hrs', goal: habitGoals.sleep, step: 0.5, quickLabel: '+30min', color: '#a78bfa' },
  ];

  return (
    <motion.div
      key="habits-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-6 pb-28 max-w-5xl mx-auto"
    >
      {/* ── Page Title ── */}
      <div className="mb-6 mt-4">
        <p className="text-[10px] font-normal uppercase tracking-[0.35em] mb-1"
          style={{ color: theme.textSecondary }}>Daily Tracking</p>
        <h2 className="text-4xl font-semibold italic tracking-tight uppercase leading-none"
          style={{ color: theme.textPrimary }}>Habits</h2>
      </div>

      {/* ━━━━ STREAKS ━━━━ */}
      <Card theme={theme}>
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} style={{ color: accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Streaks
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Workout', streak: workoutStreak, emoji: '💪' },
            { label: 'Tasks', streak: taskStreak, emoji: '✅' },
            { label: 'Protein', streak: proteinStreak, emoji: '🥩' },
          ].map(s => (
            <div key={s.label} className="text-center rounded-xl p-3" style={{ background: `${theme.background}80` }}>
              <p className="text-2xl mb-1">{s.emoji}</p>
              <p className="text-xl font-bold" style={{ color: s.streak > 0 ? accent : theme.textSecondary }}>
                {s.streak}
              </p>
              <p className="text-[8px] uppercase tracking-widest" style={{ color: theme.textSecondary }}>{s.label}</p>
              {s.streak > 0 && (
                <p className="text-[9px] mt-1" style={{ color: accent }}>🔥 day{s.streak > 1 ? 's' : ''}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ━━━━ STEPS & SLEEP TRACKING ━━━━ */}
      <Card theme={theme}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} style={{ color: accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Daily Tracking
          </span>
        </div>

        {/* Quick log buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {HABIT_CONFIG.map(h => {
            const Icon = h.icon;
            return (
              <button
                key={h.key}
                onClick={() => updateHabit(h.key, h.step)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 border"
                style={{ borderColor: `${h.color}30`, color: h.color, background: `${h.color}08` }}
              >
                <Icon size={12} /> {h.quickLabel}
              </button>
            );
          })}
        </div>

        {/* Progress bars */}
        <div className="space-y-4">
          {HABIT_CONFIG.map(h => {
            const val = habits[h.key] || 0;
            const pct = Math.min((val / h.goal) * 100, 100);
            const Icon = h.icon;
            return (
              <div key={h.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color: h.color }} />
                    <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{h.label}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: pct >= 100 ? accent : theme.textSecondary }}>
                    {val}{h.unit} / {h.goal}{h.unit}
                    {pct >= 100 && ' ✓'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateHabit(h.key, -h.step)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90 border"
                    style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary, background: `${theme.background}80` }}
                  >
                    −
                  </button>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: `${theme.textPrimary}10` }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: pct >= 100 ? accent : h.color }}
                    />
                  </div>
                  <button
                    onClick={() => updateHabit(h.key, h.step)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90 border"
                    style={{ borderColor: `${accent}20`, color: accent, background: `${accent}08` }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
