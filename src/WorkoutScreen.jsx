import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Trophy } from 'lucide-react';
import { updateExercisePerf } from './performanceStore';

export default function WorkoutScreen({ workoutSession, theme, accent, onFinish }) {
    const [currentExIndex, setCurrentExIndex] = useState(0);
    // Initialize session state: array of exercises with an array of sets
    const [exercises, setExercises] = useState(() =>
        workoutSession.map(ex => {
            const numSets = parseInt(ex.sets?.split('×')[0] || '3');
            return {
                ...ex,
                setsData: Array.from({ length: numSets }, () => ({ reps: '', weight: '', done: false }))
            };
        })
    );

    const [restRemaining, setRestRemaining] = useState(0);

    // Rest timer logic
    useEffect(() => {
        if (restRemaining <= 0) return;
        const timer = setInterval(() => {
            setRestRemaining(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [restRemaining]);

    const activeExercise = exercises[currentExIndex];

    const toggleSet = (setIndex) => {
        setExercises(prev => {
            const copy = [...prev];
            const activeSet = copy[currentExIndex].setsData[setIndex];
            const wasDone = activeSet.done;
            activeSet.done = !wasDone;

            // Auto start rest timer if a set was just completed and not the final one
            if (!wasDone && setIndex < copy[currentExIndex].setsData.length - 1) {
                setRestRemaining(60); // 60s default rest
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

    const isAllDone = activeExercise.setsData.every(s => s.done);

    const handleNext = () => {
        // Save performance data for the current exercise before moving on
        const current = exercises[currentExIndex];
        updateExercisePerf(current.name, current.setsData);

        if (currentExIndex < exercises.length - 1) {
            setCurrentExIndex(prev => prev + 1);
            setRestRemaining(0);
        } else {
            onFinish();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col min-h-screen p-6 max-w-lg mx-auto"
            style={{ color: theme.textPrimary }}
        >
            {/* Header: Progress & Rest Timer */}
            <div className="flex justify-between items-center mb-8 mt-2">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                        Workout Progress
                    </p>
                    <p className="text-xl font-bold italic">
                        {currentExIndex + 1} / {exercises.length}
                    </p>
                </div>
                {restRemaining > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm"
                        style={{ background: `${accent}15`, borderColor: accent, color: accent }}
                    >
                        <Clock size={16} />
                        <span className="font-mono font-semibold tracking-wider">{Math.floor(restRemaining / 60)}:{(restRemaining % 60).toString().padStart(2, '0')}</span>
                    </motion.div>
                )}
            </div>

            {/* Active Exercise Card */}
            <div className="flex-1">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={`ex-${currentExIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="rounded-[2rem] p-6 border flex flex-col gap-6 shadow-xl"
                        style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
                    >
                        <div>
                            <h2 className="text-3xl font-bold leading-tight" style={{ color: theme.textPrimary }}>
                                {activeExercise.name}
                            </h2>
                            <p className="text-xs mt-1 tracking-widest uppercase font-medium" style={{ color: accent }}>
                                {activeExercise.muscle} • {activeExercise.equipment}
                            </p>
                        </div>

                        {/* Sets List */}
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                                <div className="col-span-2 text-center">Set</div>
                                <div className="col-span-4 text-center">Lbs / Kg</div>
                                <div className="col-span-4 text-center">Reps</div>
                                <div className="col-span-2 text-center">Done</div>
                            </div>

                            {activeExercise.setsData.map((set, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-12 gap-3 items-center rounded-2xl p-2 transition-all border"
                                    style={{
                                        background: set.done ? `${accent}10` : `${theme.background}60`,
                                        borderColor: set.done ? accent : `${theme.textPrimary}05`,
                                        opacity: set.done ? 0.6 : 1
                                    }}
                                >
                                    <div className="col-span-2 text-center font-bold text-sm">{i + 1}</div>
                                    <div className="col-span-4">
                                        <input
                                            type="number" placeholder="--"
                                            value={set.weight} onChange={(e) => updateSet(i, 'weight', e.target.value)}
                                            className="w-full text-center py-3 rounded-xl bg-transparent outline-none font-mono text-lg transition-all"
                                            style={{ color: theme.textPrimary, background: set.done ? 'transparent' : `${theme.textPrimary}08` }}
                                            disabled={set.done}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="number" placeholder="--"
                                            value={set.reps} onChange={(e) => updateSet(i, 'reps', e.target.value)}
                                            className="w-full text-center py-3 rounded-xl bg-transparent outline-none font-mono text-lg transition-all"
                                            style={{ color: theme.textPrimary, background: set.done ? 'transparent' : `${theme.textPrimary}08` }}
                                            disabled={set.done}
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            onClick={() => toggleSet(i)}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                            style={{
                                                background: set.done ? accent : `${theme.textPrimary}10`,
                                                color: set.done ? theme.background : theme.textSecondary
                                            }}
                                        >
                                            <Check size={20} strokeWidth={set.done ? 4 : 2} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Next / Finish Button */}
                        <div className="mt-4 pt-4 border-t flex justify-end" style={{ borderColor: `${theme.textPrimary}08` }}>
                            <button
                                onClick={handleNext}
                                className="py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                                style={{
                                    background: isAllDone ? accent : `${theme.textPrimary}10`,
                                    color: isAllDone ? theme.background : theme.textPrimary
                                }}
                            >
                                {currentExIndex < exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
                                {isAllDone && <Trophy size={16} />}
                            </button>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>

        </motion.div>
    );
}
