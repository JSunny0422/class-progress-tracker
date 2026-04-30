import { useState, useEffect } from 'react';

const DEFAULT = {
  classes: [],
  students: [],
  subjects: [],
  lessons: [],
  notes: [],
};

export function useStore() {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem('classTracker');
      return stored ? { ...DEFAULT, ...JSON.parse(stored) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  useEffect(() => {
    localStorage.setItem('classTracker', JSON.stringify(data));
  }, [data]);

  function update(key, fn) {
    setData(d => ({ ...d, [key]: fn(d[key]) }));
  }

  return {
    ...data,
    addClass: (name) => update('classes', list => [...list, { id: `${Date.now()}`, name }]),
    removeClass: (id) => setData(d => ({
      ...d,
      classes: d.classes.filter(c => c.id !== id),
      students: d.students.filter(s => s.classId !== id),
    })),
    addStudent: (name, classId) => update('students', list => [...list, { id: `${Date.now()}`, name, classId }]),
    addStudents: (names, classId) => update('students', list => [
      ...list,
      ...names.map((name, i) => ({ id: `${Date.now()}_${i}`, name, classId })),
    ]),
    removeStudent: (id) => setData(d => ({
      ...d,
      students: d.students.filter(s => s.id !== id),
      notes: d.notes.filter(n => n.studentId !== id),
    })),
    addSubject: (name) => update('subjects', list => [...list, { id: `${Date.now()}`, name }]),
    removeSubject: (id) => setData(d => ({
      ...d,
      subjects: d.subjects.filter(s => s.id !== id),
    })),
    addLesson: (lesson) => {
      const id = `${Date.now()}`;
      setData(d => ({ ...d, lessons: [...d.lessons, { id, ...lesson }] }));
      return id;
    },
    saveNote: (lessonId, studentId, note) => {
      setData(d => {
        const existing = d.notes.find(n => n.lessonId === lessonId && n.studentId === studentId);
        if (existing) {
          return { ...d, notes: d.notes.map(n => n.id === existing.id ? { ...n, note } : n) };
        }
        return { ...d, notes: [...d.notes, { id: `${Date.now()}_${studentId}`, lessonId, studentId, note }] };
      });
    },
    removeNote: (id) => update('notes', list => list.filter(n => n.id !== id)),
    removeLesson: (id) => setData(d => ({
      ...d,
      lessons: d.lessons.filter(l => l.id !== id),
      notes: d.notes.filter(n => n.lessonId !== id),
    })),
  };
}
