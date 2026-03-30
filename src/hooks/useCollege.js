import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export function useCollege() {
  const [timetable, setTimetable] = useState(() => storage.getObject('siuTimetable', {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: []
  }));

  const [subjects, setSubjects] = useState(() => storage.getObject('siuSubjects', {
    'CSE': { present: 0, total: 0 },
    'MTH': { present: 0, total: 0 },
    'PHY': { present: 0, total: 0 },
  }));

  const [assignments, setAssignments] = useState(() => storage.getObject('siuAssignments', []));
  const [exams, setExams] = useState(() => storage.getObject('siuExams', []));

  useEffect(() => { storage.setObject('siuTimetable', timetable); }, [timetable]);
  useEffect(() => { storage.setObject('siuSubjects', subjects); }, [subjects]);
  useEffect(() => { storage.setObject('siuAssignments', assignments); }, [assignments]);
  useEffect(() => { storage.setObject('siuExams', exams); }, [exams]);

  const updateAttendance = (subject, isPresent) => {
    setSubjects(prev => {
      const current = prev[subject] || { present: 0, total: 0 };
      return {
        ...prev,
        [subject]: {
          present: current.present + (isPresent ? 1 : 0),
          total: current.total + 1
        }
      };
    });
  };

  const addClass = (day, newClass) => {
    setTimetable(prev => ({
      ...prev,
      [day]: [...prev[day], newClass].sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  const addAssignment = (assignment) => {
    setAssignments(prev => [...prev, { ...assignment, id: Date.now() }]);
  };

  const toggleAssignment = (id) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
  };

  const addExam = (exam) => {
    setExams(prev => [...prev, { ...exam, id: Date.now() }]);
  };

  return {
    timetable,
    subjects,
    assignments,
    exams,
    updateAttendance,
    addClass,
    addAssignment,
    toggleAssignment,
    addExam
  };
}
