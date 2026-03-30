import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, CheckCircle2, Circle, Plus, Trash2, Bell, BellOff,
    ChevronLeft, ChevronRight,
    StickyNote, Dumbbell, X, Clock
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
import { storage } from '../services/storage';

const lsGet = (key, fallback = null) => storage.getObject(key, fallback);
const lsSet = (key, val) => storage.setObject(key, val);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayKey = () => dateKey(new Date());
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ─── Notification helper ──────────────────────────────────────────────────────
const scheduleNotification = (title, body, triggerTime) => {
    if (!('Notification' in window)) return null;
    if (Notification.permission === 'default') Notification.requestPermission();
    if (Notification.permission !== 'granted') return null;

    const now = Date.now();
    const delay = triggerTime - now;
    if (delay <= 0) return null;

    return setTimeout(() => {
        new Notification(title, { body, icon: '💪' });
    }, delay);
};

// ─── Calendar Component ───────────────────────────────────────────────────────
function MonthCalendar({ selectedDate, onSelect, theme, accent, tasksByDate }) {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const prev = () => setViewDate(new Date(year, month - 1, 1));
    const next = () => setViewDate(new Date(year, month + 1, 1));

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selKey = dateKey(selectedDate);
    const todayKeyStr = dateKey(today);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prev} className="p-2 rounded-xl transition-all active:scale-90"
                    style={{ color: accent }}>
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em]"
                    style={{ color: theme.textPrimary }}>
                    {MONTHS[month]} {year}
                </h3>
                <button onClick={next} className="p-2 rounded-xl transition-all active:scale-90"
                    style={{ color: accent }}>
                    <ChevronRight size={20} />
                </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-[9px] uppercase tracking-widest font-medium py-1"
                        style={{ color: theme.textSecondary }}>{d}</div>
                ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const dk = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = dk === selKey;
                    const isToday = dk === todayKeyStr;
                    const hasTasks = tasksByDate[dk] && tasksByDate[dk].length > 0;
                    return (
                        <button
                            key={dk}
                            onClick={() => onSelect(new Date(year, month, day))}
                            className="relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all active:scale-90"
                            style={{
                                background: isSelected ? accent : isToday ? `${accent}15` : 'transparent',
                                color: isSelected ? theme.background : isToday ? accent : theme.textPrimary,
                            }}
                        >
                            <span className="text-xs font-medium">{day}</span>
                            {hasTasks && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: accent }} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

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

// ─── RoutineScreen (Calendar + Tasks + Notes + Workout) ───────────────────────
export default function RoutineScreen({ theme, accent }) {
    // ── Selected date ────────────────────────────────────────────────────────
    const [selectedDate, setSelectedDate] = useState(new Date());
    const sk = dateKey(selectedDate);

    // ── Tasks ────────────────────────────────────────────────────────────────
    const [allTasks, setAllTasks] = useState(() => lsGet('siuRoutineTasks', {}));
    const tasks = allTasks[sk] || [];
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newTaskReminder, setNewTaskReminder] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);

    // ── Notes ────────────────────────────────────────────────────────────────
    const [allNotes, setAllNotes] = useState(() => lsGet('siuRoutineNotes', {}));
    const note = allNotes[sk] || '';

    // ── Workout attachment ───────────────────────────────────────────────────
    const [allWorkouts, setAllWorkouts] = useState(() => lsGet('siuRoutineWorkout', {}));
    const attachedWorkout = allWorkouts[sk] || '';
    const [workoutInput, setWorkoutInput] = useState('');
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);

    // ── Reminder timers ─────────────────────────────────────────────────────
    const timerRefs = useRef([]);

    // ── Persist everything ──────────────────────────────────────────────────
    useEffect(() => { lsSet('siuRoutineTasks', allTasks); }, [allTasks]);
    useEffect(() => { lsSet('siuRoutineNotes', allNotes); }, [allNotes]);
    useEffect(() => { lsSet('siuRoutineWorkout', allWorkouts); }, [allWorkouts]);

    // ── Schedule reminders for today's tasks ────────────────────────────────
    useEffect(() => {
        timerRefs.current.forEach(t => clearTimeout(t));
        timerRefs.current = [];

        const tk = todayKey();
        const todayTasks = allTasks[tk] || [];
        todayTasks.forEach(task => {
            if (task.reminder && task.time && !task.done) {
                const [h, m] = task.time.split(':').map(Number);
                const triggerDate = new Date();
                triggerDate.setHours(h, m, 0, 0);
                const timer = scheduleNotification(
                    '⏰ Routine Reminder',
                    task.title,
                    triggerDate.getTime()
                );
                if (timer) timerRefs.current.push(timer);
            }
        });

        return () => timerRefs.current.forEach(t => clearTimeout(t));
    }, [allTasks]);

    // ── Task handlers ───────────────────────────────────────────────────────
    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const task = {
            id: uid(),
            title: newTaskTitle.trim(),
            time: newTaskTime || null,
            reminder: newTaskReminder && !!newTaskTime,
            done: false,
        };
        setAllTasks(prev => ({ ...prev, [sk]: [...(prev[sk] || []), task] }));
        setNewTaskTitle('');
        setNewTaskTime('');
        setNewTaskReminder(false);
        setShowAddTask(false);
    };

    const toggleTask = (id) => {
        setAllTasks(prev => ({
            ...prev,
            [sk]: (prev[sk] || []).map(t => t.id === id ? { ...t, done: !t.done } : t)
        }));
    };

    const deleteTask = (id) => {
        setAllTasks(prev => ({
            ...prev,
            [sk]: (prev[sk] || []).filter(t => t.id !== id)
        }));
    };

    // ── Note handler ────────────────────────────────────────────────────────
    const updateNote = (val) => {
        setAllNotes(prev => ({ ...prev, [sk]: val }));
    };

    // ── Workout attach handler ──────────────────────────────────────────────
    const attachWorkout = () => {
        if (!workoutInput.trim()) return;
        setAllWorkouts(prev => ({ ...prev, [sk]: workoutInput.trim() }));
        setWorkoutInput('');
        setShowWorkoutForm(false);
    };

    const removeWorkout = () => {
        setAllWorkouts(prev => {
            const copy = { ...prev };
            delete copy[sk];
            return copy;
        });
    };

    return (
        <motion.div
            key="routine-screen"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="min-h-screen p-6 pb-28 max-w-5xl mx-auto"
        >
            {/* ── Page Title ── */}
            <div className="mb-6 mt-4">
                <p className="text-[10px] font-normal uppercase tracking-[0.35em] mb-1"
                    style={{ color: theme.textSecondary }}>Daily Planner</p>
                <h2 className="text-4xl font-semibold italic tracking-tight uppercase leading-none"
                    style={{ color: theme.textPrimary }}>Routine</h2>
            </div>

            {/* ━━━━ CALENDAR ━━━━ */}
            <Card theme={theme}>
                <MonthCalendar
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    theme={theme}
                    accent={accent}
                    tasksByDate={allTasks}
                />
            </Card>

            {/* ── Selected Date Label ── */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-3 px-1" style={{ color: accent }}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            {/* ━━━━ DAILY TASKS ━━━━ */}
            <Card theme={theme}>
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} style={{ color: accent }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
                        Tasks
                    </span>
                    {tasks.length > 0 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${accent}15`, color: accent }}>
                            {tasks.length}
                        </span>
                    )}
                </div>

                {/* Task list */}
                <AnimatePresence>
                    {tasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 py-3 border-b"
                            style={{ borderColor: `${theme.textPrimary}06` }}
                        >
                            <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 transition-all active:scale-90">
                                {task.done
                                    ? <CheckCircle2 size={20} style={{ color: accent }} />
                                    : <Circle size={20} style={{ color: theme.textSecondary }} />
                                }
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${task.done ? 'line-through' : ''}`}
                                    style={{ color: task.done ? theme.textSecondary : theme.textPrimary, opacity: task.done ? 0.5 : 1 }}>
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {task.time && (
                                        <span className="text-[9px] uppercase tracking-widest flex items-center gap-1"
                                            style={{ color: theme.textSecondary }}>
                                            <Clock size={10} /> {task.time}
                                        </span>
                                    )}
                                    {task.reminder && (
                                        <span className="text-[9px] uppercase tracking-widest flex items-center gap-1" style={{ color: accent }}>
                                            <Bell size={10} /> Reminder
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="flex-shrink-0 transition-all active:scale-90 p-1"
                                style={{ color: theme.textSecondary }}>
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: theme.textSecondary }}>
                        No tasks for this day
                    </p>
                )}

                {/* Add task form */}
                {showAddTask ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-3"
                    >
                        <input
                            type="text"
                            placeholder="Task title..."
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addTask()}
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                            style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
                        />
                        <div className="flex gap-2 items-center">
                            <input
                                type="time"
                                value={newTaskTime}
                                onChange={e => setNewTaskTime(e.target.value)}
                                className="px-3 py-2 rounded-xl text-xs outline-none border flex-1"
                                style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
                            />
                            <button
                                onClick={() => setNewTaskReminder(!newTaskReminder)}
                                className="px-3 py-2 rounded-xl border text-xs flex items-center gap-1 transition-all"
                                style={{
                                    borderColor: newTaskReminder ? accent : `${theme.textPrimary}10`,
                                    color: newTaskReminder ? accent : theme.textSecondary,
                                    background: newTaskReminder ? `${accent}10` : `${theme.background}80`,
                                }}
                            >
                                {newTaskReminder ? <Bell size={12} /> : <BellOff size={12} />}
                                {newTaskReminder ? 'On' : 'Off'}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={addTask}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-95"
                                style={{ background: accent, color: theme.background }}>
                                Add Task
                            </button>
                            <button onClick={() => setShowAddTask(false)}
                                className="px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 border"
                                style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <button
                        onClick={() => setShowAddTask(true)}
                        className="w-full mt-3 py-3 rounded-xl border border-dashed text-xs uppercase tracking-widest font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                        style={{ borderColor: `${accent}30`, color: accent }}
                    >
                        <Plus size={14} /> Add Task
                    </button>
                )}
            </Card>

            {/* ━━━━ WORKOUT ATTACHMENT ━━━━ */}
            <Card theme={theme}>
                <div className="flex items-center gap-2 mb-3">
                    <Dumbbell size={16} style={{ color: accent }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
                        Workout
                    </span>
                </div>
                {attachedWorkout ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{attachedWorkout}</p>
                            <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: theme.textSecondary }}>Planned Workout</p>
                        </div>
                        <button onClick={removeWorkout}
                            className="p-2.5 rounded-xl transition-all active:scale-90 border"
                            style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}>
                            <X size={14} />
                        </button>
                    </div>
                ) : showWorkoutForm ? (
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="e.g. Chest Day, Pull Workout..."
                            value={workoutInput}
                            onChange={e => setWorkoutInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && attachWorkout()}
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                            style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
                        />
                        <div className="flex gap-2">
                            <button onClick={attachWorkout}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-95"
                                style={{ background: accent, color: theme.background }}>
                                Attach
                            </button>
                            <button onClick={() => setShowWorkoutForm(false)}
                                className="px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 border"
                                style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowWorkoutForm(true)}
                        className="w-full py-3 rounded-xl border border-dashed text-xs uppercase tracking-widest font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                        style={{ borderColor: `${accent}30`, color: accent }}
                    >
                        <Plus size={14} /> Attach Workout
                    </button>
                )}
            </Card>

            {/* ━━━━ DAILY NOTES ━━━━ */}
            <Card theme={theme}>
                <div className="flex items-center gap-2 mb-3">
                    <StickyNote size={16} style={{ color: accent }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
                        Notes
                    </span>
                </div>
                <textarea
                    value={note}
                    onChange={e => updateNote(e.target.value)}
                    placeholder="Add notes for this day..."
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border resize-none"
                    style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
                />
            </Card>
        </motion.div>
    );
}
