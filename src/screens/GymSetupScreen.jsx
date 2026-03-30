import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Dumbbell, ChevronRight } from 'lucide-react';
import { getExercisePerf } from '../performanceStore';

const REST_PRESETS = [30, 45, 60, 90, 120];

// Parse a "3×10" sets string → { sets: 3, reps: 10 }
function parseSetsString(setsStr) {
  if (!setsStr) return { sets: 3, reps: 10 };
  const match = String(setsStr).match(/(\d+)\s*[×x]\s*(\d+)/i);
  if (match) return { sets: parseInt(match[1], 10), reps: parseInt(match[2], 10) };
  const single = parseInt(setsStr, 10);
  if (!isNaN(single)) return { sets: single, reps: 10 };
  return { sets: 3, reps: 10 };
}

export default function GymSetupScreen({ workoutSession, theme, accent, onStart, onCancel }) {
  const [restTime, setRestTime] = useState(60);
  const [customRest, setCustomRest] = useState('');
  const [useCustomRest, setUseCustomRest] = useState(false);

  // Per-exercise config: array matching workoutSession order
  const [exerciseConfigs, setExerciseConfigs] = useState(() =>
    workoutSession.map((ex) => {
      const parsed = parseSetsString(ex.sets);
      const perf = getExercisePerf(ex.name);
      return {
        name: ex.name,
        weight: perf?.lastWeight ? String(perf.lastWeight) : '',
        sets: String(parsed.sets),
        targetReps: String(parsed.reps),
      };
    })
  );

  const updateConfig = (idx, field, value) => {
    setExerciseConfigs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const effectiveRestTime = useCustomRest
    ? (parseInt(customRest, 10) || 60)
    : restTime;

  const handleStart = () => {
    const sessionConfig = {
      restTime: effectiveRestTime,
      exercises: workoutSession.map((ex, i) => ({
        ...ex,
        weight: parseFloat(exerciseConfigs[i].weight) || 0,
        sets: parseInt(exerciseConfigs[i].sets, 10) || 3,
        targetReps: parseInt(exerciseConfigs[i].targetReps, 10) || 10,
      })),
    };
    onStart(sessionConfig);
  };

  const inputBase = {
    background: `${theme.background}80`,
    borderColor: `${theme.textPrimary}12`,
    color: theme.textPrimary,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
      className="min-h-screen flex flex-col max-w-lg mx-auto px-5 pb-32"
      style={{ color: theme.textPrimary }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 pt-6 pb-8 mt-2">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90"
          style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[10px] font-normal uppercase tracking-[0.35em]" style={{ color: theme.textSecondary }}>
            Configure
          </p>
          <h2 className="text-3xl font-semibold italic tracking-tight uppercase leading-none">
            Gym Setup
          </h2>
        </div>
      </div>

      {/* ── Rest Time Section ── */}
      <div
        className="rounded-[2rem] p-5 border mb-5"
        style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} style={{ color: accent }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>
            Rest Time Between Sets
          </p>
        </div>

        {/* Preset pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {REST_PRESETS.map((t) => {
            const active = !useCustomRest && restTime === t;
            return (
              <button
                key={t}
                onClick={() => { setRestTime(t); setUseCustomRest(false); }}
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all active:scale-95"
                style={
                  active
                    ? { background: accent, color: theme.background, borderColor: accent }
                    : { background: 'transparent', color: theme.textSecondary, borderColor: `${theme.textPrimary}15` }
                }
              >
                {t}s
              </button>
            );
          })}

          {/* Custom pill */}
          <button
            onClick={() => setUseCustomRest(true)}
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all active:scale-95"
            style={
              useCustomRest
                ? { background: accent, color: theme.background, borderColor: accent }
                : { background: 'transparent', color: theme.textSecondary, borderColor: `${theme.textPrimary}15` }
            }
          >
            Custom
          </button>
        </div>

        {/* Custom rest input */}
        {useCustomRest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3"
          >
            <input
              type="number"
              placeholder="Seconds"
              value={customRest}
              onChange={(e) => setCustomRest(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none border font-mono"
              style={inputBase}
              min={10}
              max={600}
            />
            <span className="text-xs uppercase tracking-widest" style={{ color: theme.textSecondary }}>sec</span>
          </motion.div>
        )}

        {/* Active rest display */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest"
            style={{ background: `${accent}15`, color: accent }}
          >
            {effectiveRestTime}s rest selected
          </div>
        </div>
      </div>

      {/* ── Exercise Config Cards ── */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: theme.textSecondary }}>
        {workoutSession.length} Exercise{workoutSession.length !== 1 ? 's' : ''} — Set Targets
      </p>

      <div className="flex flex-col gap-4">
        {workoutSession.map((ex, idx) => {
          const perf = getExercisePerf(ex.name);
          const cfg = exerciseConfigs[idx];

          return (
            <motion.div
              key={ex.name + idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05, duration: 0.35 } }}
              className="rounded-[2rem] p-5 border"
              style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
            >
              {/* Exercise title */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${accent}15`, color: accent }}
                >
                  <Dumbbell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug truncate" style={{ color: theme.textPrimary }}>
                    {ex.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: accent }}>
                    {ex.muscle} · {ex.equipment}
                  </p>
                  {/* Previous performance hint */}
                  {perf && (
                    <p className="text-[9px] mt-1 font-medium" style={{ color: theme.textSecondary }}>
                      PR: {perf.maxWeight}kg · Last: {perf.lastWeight}kg
                    </p>
                  )}
                </div>
              </div>

              {/* Config inputs row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Weight */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={cfg.weight}
                    onChange={(e) => updateConfig(idx, 'weight', e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-center text-sm font-mono outline-none border transition-all"
                    style={inputBase}
                    min={0}
                  />
                </div>

                {/* Sets */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Sets
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    value={cfg.sets}
                    onChange={(e) => updateConfig(idx, 'sets', e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-center text-sm font-mono outline-none border transition-all"
                    style={inputBase}
                    min={1}
                    max={20}
                  />
                </div>

                {/* Target Reps */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Target Reps
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={cfg.targetReps}
                    onChange={(e) => updateConfig(idx, 'targetReps', e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-center text-sm font-mono outline-none border transition-all"
                    style={inputBase}
                    min={1}
                    max={100}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Start Workout CTA ── */}
      <div
        className="fixed bottom-0 left-0 right-0 p-5 border-t"
        style={{ background: `${theme.background}ee`, backdropFilter: 'blur(16px)', borderColor: `${theme.textPrimary}08` }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleStart}
            className="w-full py-5 rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xl"
            style={{ background: accent, color: theme.background, boxShadow: `0 8px 32px ${accent}40` }}
          >
            Start Workout
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
