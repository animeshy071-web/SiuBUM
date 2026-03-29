// ─── Exercise Performance Store ──────────────────────────────────────────────
// Persists per-exercise performance data in localStorage under key 'siuExercisePerf'.
// Shape: { [exerciseName]: { maxWeight: number, lastWeight: number, sets: number[] } }

const STORAGE_KEY = 'siuExercisePerf';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded — silently fail */ }
}

/**
 * Get performance data for a single exercise.
 * @returns {{ maxWeight: number, lastWeight: number, sets: number[] } | null}
 */
export function getExercisePerf(exerciseName) {
  const all = readAll();
  return all[exerciseName] || null;
}

/**
 * Get the full map of all exercise performance data.
 */
export function getAllPerf() {
  return readAll();
}

/**
 * Update performance data after a workout session for a given exercise.
 * @param {string} exerciseName
 * @param {{ weight: string|number, reps: string|number, done: boolean }[]} setsData
 */
export function updateExercisePerf(exerciseName, setsData) {
  const all = readAll();
  const existing = all[exerciseName] || { maxWeight: 0, lastWeight: 0, sets: [] };

  // Only consider completed sets with a weight entered
  const completedSets = setsData.filter(s => s.done && s.weight !== '' && s.weight !== undefined);
  if (completedSets.length === 0) return; // nothing to record

  // Compute the max weight used this session
  const sessionMaxWeight = Math.max(...completedSets.map(s => parseFloat(s.weight) || 0));

  // Reps array for completed sets
  const repsArray = completedSets.map(s => parseInt(s.reps, 10) || 0);

  // Update fields
  existing.lastWeight = sessionMaxWeight;
  existing.sets = repsArray;

  if (sessionMaxWeight > existing.maxWeight) {
    existing.maxWeight = sessionMaxWeight;
  }

  all[exerciseName] = existing;
  writeAll(all);
}
