import { useState, useEffect } from 'react';
import { updateExercisePerf } from '../performanceStore';

export function useActiveWorkout(workoutSession, sessionConfig, onFinish) {
  const restTime = sessionConfig?.restTime ?? 60;
  const [currentExIndex, setCurrentExIndex] = useState(0);

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

  useEffect(() => {
    if (restRemaining <= 0) return;
    const timer = setInterval(() => {
      setRestRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [restRemaining]);

  const toggleSet = (setIndex) => {
    setExercises(prev => {
      const copy = [...prev];
      const activeSet = copy[currentExIndex].setsData[setIndex];
      const wasDone = activeSet.done;
      activeSet.done = !wasDone;

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
    const current = exercises[currentExIndex];
    updateExercisePerf(current.name, current.setsData);

    if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      setRestRemaining(0);
      setShowHistory(false);
    } else {
      if (onFinish) onFinish();
    }
  };

  return {
    exercises,
    currentExIndex,
    restRemaining,
    setRestRemaining,
    showHistory,
    setShowHistory,
    toggleSet,
    updateSet,
    handleNext,
  };
}
