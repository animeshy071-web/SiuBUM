import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  GraduationCap, BookOpen, Clock, MapPin, User, Plus, Trash2
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

import { storage } from '../services/storage';

const lsGet = (key, fallback = null) => storage.getObject(key, fallback);
const lsSet = (key, val) => storage.setObject(key, val);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ─── Notification helper ──────────────────────────────────────────────────────
const scheduleNotification = (title, body, triggerTime) => {
  if (!('Notification' in window)) return null;
  if (Notification.permission === 'default') Notification.requestPermission();
  if (Notification.permission !== 'granted') return null;
  const delay = triggerTime - Date.now();
  if (delay <= 0) return null;
  return setTimeout(() => {
    new Notification(title, { body, icon: '💪' });
  }, delay);
};

// ─── Lecture Card (Tinder-style) ──────────────────────────────────────────────
function LectureCard({ lecture, theme, accent, onSwipeLeft, onSwipeRight, isActive }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 80) onSwipeRight?.();
    else if (info.offset.x < -80) onSwipeLeft?.();
  };

  if (!isActive) return null;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-[2rem] p-6 border flex flex-col justify-between"
      whileTap={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      layout
      key={lecture.id}
      data-testid="lecture-card"
      role="button"
      tabIndex={0}
      aria-label={`Lecture: ${lecture.subject}`}
      onKeyDown={e => { if (e.key === 'ArrowRight') onSwipeRight?.(); if (e.key === 'ArrowLeft') onSwipeLeft?.(); }}
      style={{
        x, rotate, opacity,
        background: `linear-gradient(135deg, ${theme.surface}, ${accent}08)`,
        borderColor: `${accent}30`,
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} style={{ color: accent }} />
          <span className="text-[9px] uppercase tracking-[0.3em] font-medium" style={{ color: accent }}>
            Lecture
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-3" style={{ color: theme.textPrimary }}>
          {lecture.subject}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: theme.textSecondary }} />
            <span className="text-sm" style={{ color: theme.textSecondary }}>
              {lecture.startTime} – {lecture.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} style={{ color: theme.textSecondary }} />
            <span className="text-sm" style={{ color: theme.textSecondary }}>
              {lecture.room || 'No room'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User size={14} style={{ color: theme.textSecondary }} />
            <span className="text-sm" style={{ color: theme.textSecondary }}>
              {lecture.professor || 'No professor'}
            </span>
          </div>
        </div>
      </div>
      <p className="text-[9px] uppercase tracking-widest text-center mt-4" style={{ color: theme.textSecondary }}>
        ← Swipe to navigate →
      </p>
    </motion.div>
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

// ─── CollegeScreen ────────────────────────────────────────────────────────────
export default function CollegeScreen({ theme, accent }) {
  const [lectures, setLectures] = useState(() => lsGet('siuCollegeLectures', []));
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [lectureForm, setLectureForm] = useState({
    subject: '', day: 'Monday', startTime: '', endTime: '', room: '', professor: ''
  });
  const [lectureIndex, setLectureIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(DAY_NAMES[new Date().getDay()]);
  const timerRefs = useRef([]);

  useEffect(() => { lsSet('siuCollegeLectures', lectures); }, [lectures]);

  // ── Schedule reminders ────────────────────────────────────────────────
  useEffect(() => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];

    if (lectures.length === 0) return;
    const todayDay = DAY_NAMES[new Date().getDay()];
    const todayLectures = lectures
      .filter(l => l.day === todayDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    todayLectures.forEach(lecture => {
      const [h, m] = lecture.startTime.split(':').map(Number);
      const lectureTime = new Date();
      lectureTime.setHours(h, m, 0, 0);
      const reminderTime = lectureTime.getTime() - 15 * 60 * 1000;
      const timer = scheduleNotification(
        '📚 Lecture Reminder',
        `Next lecture: ${lecture.subject} in 15 minutes`,
        reminderTime
      );
      if (timer) timerRefs.current.push(timer);
    });

    return () => timerRefs.current.forEach(t => clearTimeout(t));
  }, [lectures]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const addLecture = () => {
    if (!lectureForm.subject.trim() || !lectureForm.startTime || !lectureForm.endTime) return;
    const lecture = { ...lectureForm, id: uid(), subject: lectureForm.subject.trim() };
    setLectures(prev => [...prev, lecture]);
    setLectureForm({ subject: '', day: 'Monday', startTime: '', endTime: '', room: '', professor: '' });
    setShowAddLecture(false);
  };

  const deleteLecture = (id) => {
    setLectures(prev => prev.filter(l => l.id !== id));
  };

  const selectedDayLectures = lectures
    .filter(l => l.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <motion.div
      key="college-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-6 pb-28 max-w-5xl mx-auto"
    >
      {/* ── Page Title ── */}
      <div className="mb-6 mt-4">
        <p className="text-[10px] font-normal uppercase tracking-[0.35em] mb-1"
          style={{ color: theme.textSecondary }}>Academic</p>
        <h2 className="text-4xl font-semibold italic tracking-tight uppercase leading-none"
          style={{ color: theme.textPrimary }}>College</h2>
      </div>

      {/* ── Day Selector ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {DAY_NAMES.map(day => {
          const isActive = selectedDay === day;
          const count = lectures.filter(l => l.day === day).length;
          return (
            <button
              key={day}
              onClick={() => { setSelectedDay(day); setLectureIndex(0); }}
              className="px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 border whitespace-nowrap flex items-center gap-1.5"
              style={
                isActive
                  ? { color: accent, borderColor: accent, background: `${accent}15` }
                  : { color: theme.textSecondary, borderColor: `${theme.textPrimary}10`, background: 'transparent' }
              }
            >
              {day.slice(0, 3)}
              {count > 0 && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{ background: isActive ? accent : `${theme.textPrimary}15`, color: isActive ? theme.background : theme.textSecondary }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Lecture Cards (Tinder-style) ── */}
      {selectedDayLectures.length > 0 && (
        <Card theme={theme}>
          <p className="text-[9px] uppercase tracking-widest mb-3" style={{ color: theme.textSecondary }}>
            {selectedDay}'s Lectures — Swipe to browse
          </p>
          <div className="relative w-full h-52 overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedDayLectures.map((lecture, i) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  theme={theme}
                  accent={accent}
                  isActive={i === lectureIndex % selectedDayLectures.length}
                  onSwipeRight={() => setLectureIndex(prev => (prev + 1) % selectedDayLectures.length)}
                  onSwipeLeft={() => setLectureIndex(prev => (prev - 1 + selectedDayLectures.length) % selectedDayLectures.length)}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {selectedDayLectures.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === lectureIndex % selectedDayLectures.length ? accent : `${theme.textPrimary}20` }} />
            ))}
          </div>
        </Card>
      )}

      {selectedDayLectures.length === 0 && (
        <Card theme={theme}>
          <p className="text-xs text-center py-3" style={{ color: theme.textSecondary }}>
            No lectures on {selectedDay}
          </p>
        </Card>
      )}

      {/* ── Full Timetable ── */}
      <Card theme={theme}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} style={{ color: accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textSecondary }}>
            Timetable
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${accent}15`, color: accent }}>
            {lectures.length}
          </span>
        </div>

        {lectures.length === 0 && (
          <p className="text-xs text-center py-2" style={{ color: theme.textSecondary }}>
            No lectures added yet
          </p>
        )}

        {lectures.map(l => (
          <div key={l.id} className="flex items-center justify-between py-2 border-b"
            style={{ borderColor: `${theme.textPrimary}06` }}>
            <div>
              <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                {l.subject}
              </p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                {l.day} · {l.startTime}–{l.endTime} · {l.room || '—'} · {l.professor || '—'}
              </p>
            </div>
            <button onClick={() => deleteLecture(l.id)} className="p-1 transition-all active:scale-90"
              style={{ color: theme.textSecondary }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Add lecture form */}
        {showAddLecture ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 mt-3"
          >
            <input
              type="text" placeholder="Subject name"
              value={lectureForm.subject}
              onChange={e => setLectureForm(p => ({ ...p, subject: e.target.value }))}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
            />
            <select
              value={lectureForm.day}
              onChange={e => setLectureForm(p => ({ ...p, day: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
            >
              {DAY_NAMES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time" placeholder="Start"
                value={lectureForm.startTime}
                onChange={e => setLectureForm(p => ({ ...p, startTime: e.target.value }))}
                className="px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
              />
              <input
                type="time" placeholder="End"
                value={lectureForm.endTime}
                onChange={e => setLectureForm(p => ({ ...p, endTime: e.target.value }))}
                className="px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
              />
            </div>
            <input
              type="text" placeholder="Room (optional)"
              value={lectureForm.room}
              onChange={e => setLectureForm(p => ({ ...p, room: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
            />
            <input
              type="text" placeholder="Professor (optional)"
              value={lectureForm.professor}
              onChange={e => setLectureForm(p => ({ ...p, professor: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ background: `${theme.background}80`, borderColor: `${theme.textPrimary}10`, color: theme.textPrimary }}
            />
            <div className="flex gap-2 pt-1">
              <button onClick={addLecture}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-95"
                style={{ background: accent, color: theme.background }}>
                Add Lecture
              </button>
              <button onClick={() => setShowAddLecture(false)}
                className="px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 border"
                style={{ borderColor: `${theme.textPrimary}10`, color: theme.textSecondary }}>
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowAddLecture(true)}
            className="w-full py-3 rounded-xl border border-dashed text-xs uppercase tracking-widest font-medium transition-all active:scale-95 flex items-center justify-center gap-2 mt-3"
            style={{ borderColor: `${accent}30`, color: accent }}
          >
            <Plus size={14} /> Add Lecture
          </button>
        )}
      </Card>
    </motion.div>
  );
}
