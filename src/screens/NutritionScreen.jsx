import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beef, Droplets, Flame } from 'lucide-react';
import { useNutrition } from '../hooks/useNutrition';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

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

export default function NutritionScreen({ theme, accent }) {
  const {
    dailyProteinTotal,
    foodEntries,
    selectedFoodId,
    setSelectedFoodId,
    handleAddFood,
    handleResetFood,
    updateWater,
    waterVal,
    waterPct,
    proteinPct,
    habitGoals,
    FOODS_DB,
  } = useNutrition();

  return (
    <motion.div
      key="nutrition-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-6 pb-28 max-w-5xl mx-auto"
    >
      {/* ── Page Title ── */}
      <div className="mb-6 mt-4">
        <p className="text-[10px] font-normal uppercase tracking-[0.35em] mb-1"
          style={{ color: theme.textSecondary }}>Fuel Up</p>
        <h2 className="text-4xl font-semibold italic tracking-tight uppercase leading-none"
          style={{ color: theme.textPrimary }}>Nutrition</h2>
      </div>

      {/* ━━━━ PROTEIN TRACKER ━━━━ */}
      <Card theme={theme}>
        <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
          {/* Left side: Stats & Progress */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-normal uppercase tracking-widest mb-1"
                  style={{ color: theme.textSecondary }}>Daily Protein Goal</p>
                <h4 className="text-4xl font-semibold italic" style={{ color: theme.textPrimary }}>
                  {dailyProteinTotal}g{' '}
                  <span className="text-sm font-normal" style={{ color: theme.textSecondary }}>
                    / {habitGoals.protein}g
                  </span>
                </h4>
              </div>
              <Flame size={22} style={{ color: accent }} />
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: `${theme.textPrimary}10` }}>
              <motion.div
                animate={{ width: `${proteinPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: theme.progressBar }}
              />
            </div>
          </div>

          {/* Right side: Add Food Form */}
          <div className="flex-1 w-full flex flex-col gap-3">
            <p className="text-[10px] font-normal uppercase tracking-widest" style={{ color: theme.textSecondary }}>
              Log Food
            </p>
            <div className="flex gap-3">
              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
                className="flex-1 p-4 rounded-[1.5rem] outline-none text-sm border font-medium transition-all"
                style={{ background: `${theme.background}60`, borderColor: `${theme.textPrimary}15`, color: theme.textPrimary }}
              >
                <option value="" disabled>Select food item...</option>
                {FOODS_DB.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} (+{f.protein}g)
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddFood}
                disabled={!selectedFoodId}
                className="px-6 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
                style={{ background: accent, color: theme.background }}
              >
                Add
              </button>
            </div>
            <button
              onClick={handleResetFood}
              className="self-end text-[9px] uppercase tracking-widest px-3 py-1 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: theme.textSecondary }}
            >
              Reset Log
            </button>
          </div>
        </div>

        {/* Food Entries List */}
        {foodEntries.length > 0 && (
          <div className="pt-5 border-t" style={{ borderColor: `${theme.textPrimary}08` }}>
            <p className="text-[10px] font-normal uppercase tracking-widest mb-3" style={{ color: theme.textSecondary }}>
              Consumed Today
            </p>
            <div className="flex flex-wrap gap-2">
              {foodEntries.map((food, i) => (
                <div
                  key={i}
                  className="px-4 py-2 border rounded-full text-xs font-medium flex items-center gap-2"
                  style={{ background: `${theme.textPrimary}05`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
                >
                  <span className="opacity-90">{food.name}</span>
                  <span className="opacity-100 font-bold" style={{ color: accent }}>+{food.protein}g</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ━━━━ WATER TRACKER ━━━━ */}
      <Card theme={theme}>
        <div className="flex items-center gap-2 mb-4">
          <Droplets size={16} style={{ color: '#38bdf8' }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Water Intake
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>
            {waterVal} {waterVal === 1 ? 'glass' : 'glasses'}
          </span>
          <span className="text-xs font-semibold" style={{ color: waterPct >= 100 ? accent : theme.textSecondary }}>
            {waterVal} / {habitGoals.water} glasses {waterPct >= 100 && '✓'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateWater(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90 border"
            style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary, background: `${theme.background}80` }}
          >
            −
          </button>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: `${theme.textPrimary}10` }}>
            <motion.div
              animate={{ width: `${waterPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: waterPct >= 100 ? accent : '#38bdf8' }}
            />
          </div>
          <button
            onClick={() => updateWater(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90 border"
            style={{ borderColor: `${accent}20`, color: accent, background: `${accent}08` }}
          >
            +
          </button>
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => updateWater(n)}
              className="flex-1 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 border"
              style={{ borderColor: `#38bdf830`, color: '#38bdf8', background: `#38bdf808` }}
            >
              +{n} Glass{n > 1 ? 'es' : ''}
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
