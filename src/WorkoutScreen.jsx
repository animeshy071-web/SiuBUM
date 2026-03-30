import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { updateExercisePerf } from './performanceStore';

export default function WorkoutScreen({ workoutSession, sessionConfig, theme, accent, onFinish }) {
    const restTime = sessionConfig?.restTime ?? 60;

    const [currentExIndex, setCurrentExIndex] = useState(0);

    // Build initial exercises from sessionConfig (which has per-exercise weight, sets, targetReps)
    const [exercises, setExercises] = useState(() =>
        workoutSession.map((ex, i) => {
            const cfg = sessionConfig?.exercises?.[i];
            const numSets = cfg?.sets ?? parseInt(ex.sets?.split('×')[0] || '3');
            const targetReps = cfg?.targetReps ?? parseInt(ex.sets?.split('×')[1] || '10');
            const prefilledWeight = cfg?.weight ? String(cfg.weight) : '';
            return {
                ...ex,
                targetReps,
                setsData: Array.from({ length: numSets }, () => ({
                    reps: '',
                    weight: prefilledWeight,
                    done: false,
                })),
            };
        })
    );

    const [restRemaining, setRestRemaining] = useState(0);
    const [showHistory, setShowHistory] = useState(false);

    // Rest timer countdown
    useEffect(() => {
        if (restRemaining <= 0) return;
        const timer = setInterval(() => {
            setRestRemaining(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [restRemaining]);

    const activeExercise = exercises[currentExIndex];
    const completedSets = activeExercise.setsData.filter(s => s.done);
    const totalSets = activeExercise.setsData.length;
    const isAllDone = completedSets.length === totalSets;

    const toggleSet = (setIndex) => {
        setExercises(prev => {
            const copy = [...prev];
            const activeSet = copy[currentExIndex].setsData[setIndex];
            const wasDone = activeSet.done;
            activeSet.done = !wasDone;

            // Auto-start rest timer after completing a set (not on the last set)
            if (!wasDone && setIndex < copy[currentExIndex].setsData.length - 1) {
                setRestRemaining(restTime);
            }

            return copy;
        });
    };

    const updateSet = (setIndex, field, value) => {
        setExercises(prev => {
            const copy = [...prev];
            copy[currentExIndex].setsData[setIndex][field] = value;
            return copy;
        });
    };

    const handleNext = () => {
        // Save performance for current exercise
        const current = exercises[currentExIndex];
        updateExercisePerf(current.name, current.setsData);

        if (currentExIndex < exercises.length - 1) {
            setCurrentExIndex(prev => prev + 1);
            setRestRemaining(0);
            setShowHistory(false);
        } else {
            onFinish();
        }
    };

    // Progress bar across all exercises
    const totalExercises = exercises.length;
    const progressPct = Math.round(((currentExIndex) / totalExercises) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col min-h-screen p-5 max-w-lg mx-auto pb-8"
            style={{ color: theme.textPrimary }}
        >
            {/* ── Overall Progress Bar ── */}
            <div className="mt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                        Workout Progress
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                        {currentExIndex + 1} / {totalExercises}
                    </p>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: `${theme.textPrimary}10` }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: accent }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* ── Rest Timer ── */}
            <AnimatePresence>
                {restRemaining > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between px-5 py-3 rounded-2xl border mb-4"
                        style={{ background: `${accent}12`, borderColor: `${accent}40` }}
                    >
                        <div className="flex items-center gap-2" style={{ color: accent }}>
                            <Clock size={16} />
                            <span className="text-sm font-semibold uppercase tracking-widest">Rest</span>
                        </div>
                        <span className="font-mono text-2xl font-bold" style={{ color: accent }}>
                            {Math.floor(restRemaining / 60)}:{(restRemaining % 60).toString().padStart(2, '0')}
                        </span>
                        <button
                            onClick={() => setRestRemaining(0)}
                            className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all active:scale-95"
                            style={{ background: `${accent}20`, color: accent }}
                        >
                            Skip
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Active Exercise Card ── */}
            <div className="flex-1">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={`ex-${currentExIndex}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-[2rem] p-6 border flex flex-col gap-5 shadow-xl"
                        style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
                    >
                        {/* Exercise header */}
                        <div>
                            <h2 className="text-3xl font-bold leading-tight" style={{ color: theme.textPrimary }}>
                                {activeExercise.name}
                            </h2>
                            <p className="text-xs mt-1 tracking-widest uppercase font-medium" style={{ color: accent }}>
                                {activeExercise.muscle} · {activeExercise.equipment}
                            </p>
                            {/* Set progress chips */}
                            <div className="flex items-center gap-1.5 mt-3">
                                {activeExercise.setsData.map((s, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all"
                                        style={{
                                            background: s.done ? accent : `${theme.textPrimary}10`,
                                            color: s.done ? theme.background : theme.textSecondary,
                                        }}
                                    >
                                        {s.done ? <Check size={10} strokeWidth={3} /> : i + 1}
                                    </div>
                                ))}
                                <span className="text-[10px] ml-1 font-semibold" style={{ color: theme.textSecondary }}>
                                    {completedSets.length}/{totalSets} sets
                                </span>
                            </div>
                        </div>

                        {/* Sets Table */}
                        <div className="flex flex-col gap-2">
                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-2 px-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                                <div className="col-span-2 text-center">Set</div>
                                <div className="col-span-4 text-center">Weight</div>
                                <div className="col-span-4 text-center">Reps</div>
                                <div className="col-span-2 text-center">✓</div>
                            </div>

                            {activeExercise.setsData.map((set, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-12 gap-2 items-center rounded-2xl p-2 transition-all border"
                                    style={{
                                        background: set.done ? `${accent}10` : `${theme.background}60`,
                                        borderColor: set.done ? `${accent}40` : `${theme.textPrimary}05`,
                                        opacity: set.done ? 0.7 : 1,
                                    }}
                                >
                                    {/* Set number */}
                                    <div className="col-span-2 text-center font-bold text-sm">{i + 1}</div>

                                    {/* Weight input */}
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            placeholder="--"
                                            value={set.weight}
                                            onChange={(e) => updateSet(i, 'weight', e.target.value)}
                                            className="w-full text-center py-3 rounded-xl bg-transparent outline-none font-mono text-lg transition-all"
                                            style={{
                                                color: theme.textPrimary,
                                                background: set.done ? 'transparent' : `${theme.textPrimary}08`,
                                            }}
                                            disabled={set.done}
                                        />
                                    </div>

                                    {/* Reps input with target hint */}
                                    <div className="col-span-4 flex flex-col items-center">
                                        <input
                                            type="number"
                                            placeholder={String(activeExercise.targetReps)}
                                            value={set.reps}
                                            onChange={(e) => updateSet(i, 'reps', e.target.value)}
                                            className="w-full text-center py-3 rounded-xl bg-transparent outline-none font-mono text-lg transition-all"
                                            style={{
                                                color: theme.textPrimary,
                                                background: set.done ? 'transparent' : `${theme.textPrimary}08`,
                                            }}
                                            disabled={set.done}
                                        />
                                        {!set.done && (
                                            <span className="text-[8px] tracking-wider" style={{ color: theme.textSecondary }}>
                                                target: {activeExercise.targetReps}
                                            </span>
                                        )}
                                    </div>

                                    {/* Done toggle */}
                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            onClick={() => toggleSet(i)}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                            style={{
                                                background: set.done ? accent : `${theme.textPrimary}10`,
                                                color: set.done ? theme.background : theme.textSecondary,
                                            }}
                                        >
                                            <Check size={18} strokeWidth={set.done ? 3 : 2} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Completed Reps History (collapsible) ── */}
                        {completedSets.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowHistory(h => !h)}
                                    className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all"
                                    style={{ color: theme.textSecondary }}
                                >
                                    {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    Completed Sets History ({completedSets.length})
                                </button>
                                <AnimatePresence>
                                    {showHistory && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden mt-2"
                                        >
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {activeExercise.setsData.map((s, i) =>
                                                    s.done ? (
                                                        <div
                                                            key={i}
                                                            className="px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold"
                                                            style={{ background: `${accent}15`, color: accent }}
                                                        >
                                                            Set {i + 1}: {s.weight ? `${s.weight}kg × ` : ''}{s.reps || '?'} reps
                                                        </div>
                                                    ) : null
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* ── Next / Finish Button ── */}
                        <div className="pt-3 border-t flex justify-end" style={{ borderColor: `${theme.textPrimary}08` }}>
                            <button
                                onClick={handleNext}
                                className="py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 active:scale-95 transition-all"
                                style={{
                                    background: isAllDone ? accent : `${theme.textPrimary}10`,
                                    color: isAllDone ? theme.background : theme.textPrimary,
                                }}
                            >
                                {currentExIndex < exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
                                {isAllDone && <Trophy size={15} />}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
