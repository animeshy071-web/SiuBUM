import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function useRoutine() {
  const [allHabits, setAllHabits] = useState(() => storage.getObject('siuRoutineHabits', {}));
  const [habitGoals, setHabitGoals] = useState(() => storage.getObject('siuHabitGoals', {
    water: 8,
    protein: 150,
    steps: 10000,
    sleep: 7,
  }));

  const todayKey = getTodayKey();
  const currentHabits = allHabits[todayKey] || { water: 0, protein: 0, steps: 0, sleep: 0 };

  useEffect(() => {
    storage.setObject('siuRoutineHabits', allHabits);
  }, [allHabits]);

  useEffect(() => {
    storage.setObject('siuHabitGoals', habitGoals);
  }, [habitGoals]);

  const setHabitVal = (key, val) => {
    setAllHabits(prev => {
      const dayData = prev[todayKey] || { water: 0, protein: 0, steps: 0, sleep: 0 };
      return { ...prev, [todayKey]: { ...dayData, [key]: Math.max(0, val) } };
    });
  };

  const updateGoal = (key, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setHabitGoals(prev => ({ ...prev, [key]: num }));
  };

  return {
    currentHabits,
    habitGoals,
    setHabitVal,
    updateGoal,
  };
}
