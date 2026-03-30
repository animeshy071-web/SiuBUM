import { useState, useCallback, useEffect } from 'react';
import { storage } from '../services/storage';

export function useWorkoutSession() {
  const [selectedMuscle, setSelectedMuscle] = useState(() => storage.getString('siuMuscle', 'Chest'));
  const [selectedEquipment, setSelectedEquipment] = useState(() => storage.getString('siuEquip', null));
  const [customExercises, setCustomExercises] = useState(() => storage.getObject('siuCustomEx', []));

  // ── Workout Session State ──────────────────────────────────────────────
  const [workoutSession, setWorkoutSession] = useState([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [gymSetup, setGymSetup] = useState(null);
  const [sessionConfig, setSessionConfig] = useState(null);

  // Sync selection to storage
  useEffect(() => { storage.setString('siuMuscle', selectedMuscle); }, [selectedMuscle]);
  useEffect(() => { storage.setString('siuEquip', selectedEquipment || ''); }, [selectedEquipment]);
  useEffect(() => { storage.setObject('siuCustomEx', customExercises); }, [customExercises]);

  // Handlers
  const toggleEquip = useCallback((e) =>
    setSelectedEquipment(prev => prev === e ? null : e), []);

  const handleAddCustom = useCallback((ex) => setCustomExercises(prev => [...prev, ex]), []);
  const handleRemoveCustom = useCallback((ex) =>
    setCustomExercises(prev => prev.filter(x => !(x.name === ex.name && x.muscle === ex.muscle && x.equipment === ex.equipment))), []);

  const handleAddToWorkout = useCallback((ex) => {
    setWorkoutSession(prev => [...prev, ex]);
  }, []);

  const startWorkout = () => {
    if (workoutSession.length > 0) setGymSetup(true);
  };

  const confirmSetup = (config) => {
    setSessionConfig(config);
    setGymSetup(null);
    setIsWorkoutActive(true);
  };

  const cancelSetup = () => {
    setGymSetup(null);
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    setSessionConfig(null);
    setWorkoutSession([]);
  };

  return {
    selectedMuscle,
    setSelectedMuscle,
    selectedEquipment,
    toggleEquip,
    customExercises,
    handleAddCustom,
    handleRemoveCustom,
    workoutSession,
    handleAddToWorkout,
    isWorkoutActive,
    gymSetup,
    sessionConfig,
    startWorkout,
    confirmSetup,
    cancelSetup,
    finishWorkout,
  };
}
