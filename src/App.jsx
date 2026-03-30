import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Calendar, Check, Dumbbell, Flame, Home, User, Zap, Menu, UtensilsCrossed, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BodyMap, { ALL_MUSCLES, EQUIPMENT_OPTIONS } from './components/BodyMap';
import WorkoutScreen from './screens/WorkoutScreen';
import GymSetupScreen from './screens/GymSetupScreen';
import RoutineScreen from './screens/RoutineScreen';
import HomeScreen from './screens/HomeScreen';
import NutritionScreen from './screens/NutritionScreen';
import HabitsScreen from './screens/HabitsScreen';
import CollegeScreen from './screens/CollegeScreen';
import HamburgerMenu from './components/HamburgerMenu';
import { useUserSession } from './hooks/useUserSession';
import { useWorkoutSession } from './hooks/useWorkoutSession';

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED THEME CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const THEMES = {
  ben10: {
    label: 'Ben 10',
    background: '#050a03',
    surface: '#0e1a0c',
    primary: '#4ade80',
    secondary: '#16a34a',
    bodyFill: '#1a2e18',
    muscleFill: '#243320',
    textPrimary: '#f0fdf4',
    textSecondary: 'rgba(220,252,231,0.55)',
    progressBar: '#4ade80',
  },
  moonknight: {
    label: 'Moon Knight',
    background: '#05050a',
    surface: '#0f0f1a',
    primary: '#a78bfa',
    secondary: '#7c3aed',
    bodyFill: '#1a1a2e',
    muscleFill: '#23234a',
    textPrimary: '#faf5ff',
    textSecondary: 'rgba(233,213,255,0.55)',
    progressBar: '#a78bfa',
  },
  berserk: {
    label: 'Berserk',
    background: '#080402',
    surface: '#140c06',
    primary: '#f97316',
    secondary: '#ea580c',
    bodyFill: '#1e1008',
    muscleFill: '#2d1a0a',
    textPrimary: '#fff7ed',
    textSecondary: 'rgba(254,215,170,0.55)',
    progressBar: '#f97316',
  },
};

// ─── Page transition variants ─────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, theme, accent, activeTheme, onThemeChange }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState(null);
  const canSubmit = name.trim().length > 0 && gender !== null;

  return (
    <motion.div
      key="login"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-screen p-8 justify-center items-center max-w-md mx-auto"
    >
      <div className="text-center mb-14">
        <h1
          className="text-8xl font-semibold italic tracking-tight uppercase leading-none mb-2"
          style={{ color: accent, textShadow: `0 0 60px ${accent}55` }}
        >
          siuBum
        </h1>
        <p className="text-[10px] font-normal tracking-[0.5em] uppercase italic" style={{ color: theme.textSecondary }}>
          Aesthetics × Discipline
        </p>
      </div>

      {/* Theme switcher on login */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-[9px] font-normal uppercase tracking-widest" style={{ color: theme.textSecondary }}>Theme</span>
        <div className="flex gap-2">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => onThemeChange(key)}
              title={t.label}
              className="w-7 h-7 rounded-full border-2 transition-all active:scale-90"
              style={{
                background: t.primary,
                borderColor: activeTheme === key ? t.textPrimary : 'transparent',
                boxShadow: activeTheme === key ? `0 0 8px ${t.primary}88` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="w-full rounded-[2.5rem] p-1 mb-5 border"
        style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}>
        <input
          type="text"
          placeholder="Your Name, Champion"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSubmit && onLogin({ name: name.trim(), gender })}
          className="w-full bg-transparent px-6 py-5 outline-none text-xl font-normal text-center"
          style={{ color: theme.textPrimary }}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        {[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }].map(({ label, value }) => {
          const active = gender === value;
          return (
            <button
              key={value}
              onClick={() => setGender(value)}
              className="py-10 rounded-[2.5rem] border-2 transition-all duration-300 active:scale-95 hover:brightness-110"
              style={{
                background: active ? `${accent}10` : theme.surface,
                borderColor: active ? accent : `${theme.textPrimary}08`,
                color: active ? accent : theme.textSecondary,
              }}
            >
              <User size={36} className="mx-auto mb-3" />
              <span className="font-normal text-[11px] tracking-[0.3em] uppercase block">{label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => canSubmit && onLogin({ name: name.trim(), gender })}
        disabled={!canSubmit}
        className="w-full py-6 rounded-[2.5rem] font-medium text-base shadow-2xl active:scale-95 disabled:opacity-20 uppercase tracking-[0.2em] transition-all"
        style={{ background: theme.textPrimary, color: theme.background }}
      >
        Let's Go →
      </button>
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { activeTheme, setActiveTheme, user, name, isLoggedIn, handleLogin } = useUserSession();
  const theme = THEMES[activeTheme] ?? THEMES.ben10;
  const accent = theme.primary;

  const {
    selectedMuscle, setSelectedMuscle,
    selectedEquipment, toggleEquip,
    customExercises, handleAddCustom, handleRemoveCustom,
    workoutSession, handleAddToWorkout,
    isWorkoutActive, gymSetup, sessionConfig,
    startWorkout, confirmSetup, cancelSetup, finishWorkout,
  } = useWorkoutSession();

  // ── Navigation & Menu ──────────────────────────────────────────────────
  const [currentTab, setCurrentTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen transition-colors duration-700 overflow-x-hidden"
      style={{ background: theme.background, color: theme.textPrimary }}
    >
      <AnimatePresence mode="wait">

        {/* ━━━━━━━━━━━━━━━━━━ LOGIN GATE ━━━━━━━━━━━━━━━━━━ */}
        {!isLoggedIn && (
          <LoginScreen
            key="login"
            onLogin={handleLogin}
            theme={theme}
            accent={accent}
            activeTheme={activeTheme}
            onThemeChange={setActiveTheme}
          />
        )}



        {/* ━━━━━━━━━━━━━━ WORKOUT TAB — Muscle Map + Equipment ━━━━━━━━━━━━━━ */}
        {isLoggedIn && !isWorkoutActive && currentTab === 'workout' && (
          <motion.div
            key="workout-tab"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen p-6 pb-28 max-w-5xl mx-auto"
          >
            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-8 mt-4">
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.35em] mb-1"
                  style={{ color: theme.textSecondary }}>Train Hard</p>
                <h2 className="text-4xl font-semibold italic tracking-tight uppercase leading-none"
                  style={{ color: theme.textPrimary }}>Workout</h2>
              </div>
              {/* Activity icon */}
              <div
                className="w-14 h-14 rounded-2xl border flex items-center justify-center"
                style={{
                  background: `${accent}12`,
                  borderColor: `${accent}30`,
                  color: accent,
                }}
              >
                <Activity size={26} />
              </div>
            </div>



            {/* ── Full-width Body Map ── */}
            <div
              className="rounded-[2.5rem] p-6 border mb-6"
              style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-normal uppercase tracking-[0.3em]"
                  style={{ color: theme.textSecondary }}>Muscle Map</p>
                <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                  {ALL_MUSCLES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMuscle(m)}
                      className="px-2.5 py-1 rounded-full text-[8px] font-medium uppercase tracking-wider border transition-all active:scale-95"
                      style={
                        selectedMuscle === m
                          ? { color: accent, borderColor: accent, background: `${accent}15` }
                          : { color: theme.textSecondary, borderColor: `${theme.textPrimary}10`, background: 'transparent' }
                      }
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <BodyMap
                selectedMuscle={selectedMuscle}
                onSelect={setSelectedMuscle}
                theme={theme}
                accent={accent}
                selectedEquipment={selectedEquipment}
                customExercises={customExercises}
                onAddCustom={handleAddCustom}
                onRemoveCustom={handleRemoveCustom}
                onAddToWorkout={handleAddToWorkout}
              />
            </div>

            {/* ── Equipment row ── */}
            <div className="grid grid-cols-1 gap-6">
              <div
                className="rounded-[2.5rem] p-6 border"
                style={{ background: theme.surface, borderColor: `${theme.textPrimary}08` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell size={18} style={{ color: accent }} />
                  <p className="text-[10px] font-normal uppercase tracking-[0.3em]"
                    style={{ color: theme.textSecondary }}>Step 2 — Equipment</p>
                </div>
                <p className="text-[9px] mb-5 uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                  Select one to see exercises
                </p>
                <div className="flex flex-col gap-3">
                  {EQUIPMENT_OPTIONS.map((e) => {
                    const checked = selectedEquipment === e;
                    return (
                      <button
                        key={e}
                        onClick={() => toggleEquip(e)}
                        className="flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 text-left"
                        style={
                          checked
                            ? { color: accent, borderColor: accent, background: `${accent}10` }
                            : { color: theme.textSecondary, borderColor: `${theme.textPrimary}08`, background: `${theme.background}80` }
                        }
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={checked ? { background: accent, borderColor: accent } : { borderColor: theme.textSecondary }}
                        >
                          {checked && <Check size={10} color={theme.background} strokeWidth={3} />}
                        </div>
                        <span className="font-normal text-sm tracking-wide">{e}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Workout Queue Summary ── */}
            {workoutSession.length > 0 && (
              <div
                className="mt-6 rounded-[2rem] p-6 border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
                style={{ background: theme.surface, borderColor: accent }}
              >
                <div>
                  <h3 className="text-xl font-bold italic mb-1 text-white">Workout Queue</h3>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    {workoutSession.length} Exercise{workoutSession.length > 1 ? 's' : ''} Selected
                  </p>
                  <p className="text-[10px] mt-2 opacity-75 hidden sm:block">
                    {workoutSession.map(ex => ex.name).join(' • ')}
                  </p>
                </div>
                <button
                  onClick={startWorkout}
                  className="py-4 px-8 rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-md hover:brightness-110 whitespace-nowrap"
                  style={{ background: accent, color: theme.background }}
                >
                  Start Workout →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ━━━━━━━━━━━━━━ HOME SCREEN (DASHBOARD) ━━━━━━━━━━━━━━ */}
        {isLoggedIn && !isWorkoutActive && currentTab === 'home' && (
          <HomeScreen
            key="home-screen"
            theme={theme}
            accent={accent}
            name={name}
            onNavigate={setCurrentTab}
          />
        )}

        {/* ━━━━━━━━━━━━━━ NUTRITION SCREEN ━━━━━━━━━━━━━━ */}
        {isLoggedIn && !isWorkoutActive && currentTab === 'nutrition' && (
          <NutritionScreen
            key="nutrition-screen"
            theme={theme}
            accent={accent}
          />
        )}

        {/* ━━━━━━━━━━━━━━ ROUTINE SCREEN ━━━━━━━━━━━━━━ */}
        {isLoggedIn && !isWorkoutActive && currentTab === 'routine' && (
          <RoutineScreen
            key="routine-screen"
            theme={theme}
            accent={accent}
          />
        )}

        {/* ━━━━━━━━━━━━━━ COLLEGE SCREEN ━━━━━━━━━━━━━━ */}
        {isLoggedIn && !isWorkoutActive && currentTab === 'college' && (
          <CollegeScreen
            key="college-screen"
            theme={theme}
            accent={accent}
          />
        )}

        {/* ━━━━━━━━━━━━━━ GYM SETUP SCREEN ━━━━━━━━━━━━━━ */}
        {isLoggedIn && gymSetup && !isWorkoutActive && (
          <GymSetupScreen
            key="gym-setup"
            workoutSession={workoutSession}
            theme={theme}
            accent={accent}
            onStart={confirmSetup}
            onCancel={cancelSetup}
          />
        )}

        {/* ━━━━━━━━━━━━━━ WORKOUT MODE ━━━━━━━━━━━━━━ */}
        {isLoggedIn && isWorkoutActive && (
          <WorkoutScreen
            key="workout-screen"
            workoutSession={workoutSession}
            sessionConfig={sessionConfig}
            theme={theme}
            accent={accent}
            onFinish={finishWorkout}
          />
        )}

      </AnimatePresence>


      {/* ── Hamburger Menu ── */}
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        theme={theme}
        accent={accent}
        themes={THEMES}
        activeTheme={activeTheme}
        onThemeChange={(key) => { setActiveTheme(key); }}

      />

      {/* ── Top Header Bar with Hamburger ── */}
      {isLoggedIn && !isWorkoutActive && !gymSetup && (
        <div className="fixed top-0 left-0 right-0 z-30" style={{ background: `${theme.background}ee`, backdropFilter: 'blur(12px)' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
              style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}
            >
              <Menu size={20} />
            </button>
            <h1
              className="text-lg font-semibold italic uppercase tracking-tight"
              style={{ color: accent }}
            >
              siuBum
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━ BOTTOM NAVIGATION BAR ━━━━━━━━━━━━━━ */}
      {isLoggedIn && !isWorkoutActive && !gymSetup && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 border-t"
          style={{ background: theme.surface, borderColor: `${theme.textPrimary}08`, backdropFilter: 'blur(20px)' }}
        >
          <div className="max-w-5xl mx-auto flex">
            {[
              { key: 'home', label: 'Home', icon: Home },
              { key: 'workout', label: 'Workout', icon: Dumbbell },
              { key: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
              { key: 'routine', label: 'Routine', icon: Calendar },
              { key: 'college', label: 'College', icon: GraduationCap },
            ].map(tab => {
              const isActive = currentTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCurrentTab(tab.key)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 transition-all active:scale-95 relative"
                  style={{ color: isActive ? accent : theme.textSecondary }}
                >
                  <TabIcon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.1em]">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 h-0.5 w-10 rounded-full"
                      style={{ background: accent }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}