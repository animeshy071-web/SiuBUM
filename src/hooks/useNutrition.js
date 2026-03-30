import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import FOODS_DB from '../data/foods.json';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function useNutrition() {
  const [dailyProteinTotal, setDailyProteinTotal] = useState(() => parseInt(storage.getString('siuProteinTotal', '0')));
  const [foodEntries, setFoodEntries] = useState(() => storage.getObject('siuFoodEntries', []));
  const [selectedFoodId, setSelectedFoodId] = useState('');

  // Storage synced from routine screen
  const [allHabits, setAllHabits] = useState(() => storage.getObject('siuRoutineHabits', {}));
  const habitGoals = storage.getObject('siuHabitGoals', { water: 8, protein: 150, steps: 10000, sleep: 7 });
  const sk = todayKey();
  const habits = allHabits[sk] || { water: 0, protein: 0, steps: 0, sleep: 0 };

  useEffect(() => {
    storage.setString('siuProteinTotal', String(dailyProteinTotal));
    storage.setObject('siuFoodEntries', foodEntries);
  }, [dailyProteinTotal, foodEntries]);

  useEffect(() => {
    storage.setObject('siuRoutineHabits', allHabits);
  }, [allHabits]);

  const handleAddFood = () => {
    if (!selectedFoodId) return;
    const food = FOODS_DB.find(f => f.id === selectedFoodId);
    if (food) {
      setFoodEntries(prev => [...prev, food]);
      setDailyProteinTotal(prev => prev + food.protein);
      setSelectedFoodId('');
    }
  };

  const handleResetFood = () => {
    setFoodEntries([]);
    setDailyProteinTotal(0);
  };

  const updateWater = (delta) => {
    setAllHabits(prev => {
      const current = prev[sk] || { water: 0, protein: 0, steps: 0, sleep: 0 };
      const newVal = Math.max(0, (current.water || 0) + delta);
      return { ...prev, [sk]: { ...current, water: newVal } };
    });
  };

  const waterVal = habits.water || 0;
  const waterPct = Math.min((waterVal / habitGoals.water) * 100, 100);
  const proteinPct = Math.min((dailyProteinTotal / habitGoals.protein) * 100, 100);

  return {
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
  };
}
