import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Target, Droplets, Beef, Footprints, Moon } from 'lucide-react';

import { storage } from '../services/storage';

const lsGet = (key, fallback = null) => storage.getObject(key, fallback);
const lsSet = (key, val) => storage.setObject(key, val);

const DEFAULT_GOALS = { water: 8, protein: 150, steps: 10000, sleep: 7 };

export default function HamburgerMenu({
  isOpen,
  onClose,
  theme,
  accent,
  themes,
  activeTheme,
  onThemeChange,
}) {
  // ── Habit Goals state ─────────────────────────────────────────────────
  const [habitGoals, setHabitGoals] = useState(() => lsGet('siuHabitGoals', DEFAULT_GOALS));
  const [editingGoals, setEditingGoals] = useState(habitGoals);
  const [showGoalEditor, setShowGoalEditor] = useState(false);

  useEffect(() => { lsSet('siuHabitGoals', habitGoals); }, [habitGoals]);

  const saveGoals = () => {
    const sanitized = {
      water: Math.max(1, Number(editingGoals.water) || DEFAULT_GOALS.water),
      protein: Math.max(1, Number(editingGoals.protein) || DEFAULT_GOALS.protein),
      steps: Math.max(1, Number(editingGoals.steps) || DEFAULT_GOALS.steps),
      sleep: Math.max(0.5, Number(editingGoals.sleep) || DEFAULT_GOALS.sleep),
    };
    setHabitGoals(sanitized);
    setEditingGoals(sanitized);
    setShowGoalEditor(false);
  };

  const THEME_NAMES = {
    ben10: { name: 'Ben10', desc: 'Black + Green' },
    moonknight: { name: 'MoonKnight', desc: 'Grey + White + Yellow' },
    berserk: { name: 'Berserk', desc: 'Dark Grey + Red' },
  };

  const GOAL_FIELDS = [
    { key: 'water', label: 'Water (glasses)', icon: Droplets, color: '#38bdf8' },
    { key: 'protein', label: 'Protein (g)', icon: Beef, color: '#f97316' },
    { key: 'steps', label: 'Steps', icon: Footprints, color: '#4ade80' },
    { key: 'sleep', label: 'Sleep (hrs)', icon: Moon, color: '#a78bfa' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] overflow-y-auto"
            style={{ background: theme.surface }}
          >
            <div className="p-6">
              {/* Close button */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold italic uppercase tracking-tight" style={{ color: theme.textPrimary }}>
                  Menu
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
                  style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* ━━━━ THEMES ━━━━ */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Palette size={16} style={{ color: accent }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
                    Themes
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(themes).map(([key, t]) => {
                    const isActive = activeTheme === key;
                    const info = THEME_NAMES[key] || { name: key, desc: '' };
                    return (
                      <button
                        key={key}
                        onClick={() => onThemeChange(key)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98]"
                        style={{
                          background: isActive ? `${t.primary}15` : `${theme.background}80`,
                          borderColor: isActive ? t.primary : `${theme.textPrimary}08`,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 flex-shrink-0"
                          style={{
                            background: t.primary,
                            borderColor: isActive ? t.textPrimary : 'transparent',
                            boxShadow: isActive ? `0 0 10px ${t.primary}66` : 'none',
                          }}
                        />
                        <div className="text-left">
                          <p className="text-sm font-semibold" style={{ color: isActive ? t.primary : theme.textPrimary }}>
                            {info.name}
                          </p>
                          <p className="text-[9px] uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                            {info.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ━━━━ HABIT GOALS ━━━━ */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={16} style={{ color: accent }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
                    Habit Goals
                  </span>
                </div>

                {!showGoalEditor ? (
                  <div>
                    <div className="space-y-2 mb-3">
                      {GOAL_FIELDS.map(g => {
                        const GoalIcon = g.icon;
                        return (
                          <div key={g.key} className="flex items-center justify-between py-2 px-3 rounded-xl"
                            style={{ background: `${theme.background}80` }}>
                            <div className="flex items-center gap-2">
                              <GoalIcon size={14} style={{ color: g.color }} />
                              <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{g.label}</span>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: accent }}>{habitGoals[g.key]}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => { setEditingGoals(habitGoals); setShowGoalEditor(true); }}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-95 border"
                      style={{ borderColor: `${accent}30`, color: accent }}
                    >
                      Edit Goals
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>
                      Customize Goals
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {GOAL_FIELDS.map(g => {
                        const GoalIcon = g.icon;
                        return (
                          <div key={g.key}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <GoalIcon size={12} style={{ color: g.color }} />
                              <label className="text-[9px] uppercase tracking-widest font-medium" style={{ color: theme.textSecondary }}>
                                {g.label}
                              </label>
                            </div>
                            <input
                              type="number"
                              min="1"
                              step={g.key === 'sleep' ? '0.5' : '1'}
                              value={editingGoals[g.key]}
                              onChange={e => setEditingGoals(prev => ({ ...prev, [g.key]: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg text-sm outline-none border text-center font-semibold"
                              style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveGoals}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-95"
                        style={{ background: accent, color: theme.background }}>
                        Save Goals
                      </button>
                      <button onClick={() => setShowGoalEditor(false)}
                        className="px-4 py-2 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 border"
                        style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}>
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
