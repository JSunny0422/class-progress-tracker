import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useStore(userId) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const col = (name) => collection(db, 'users', userId, name);
  const docRef = (name, id) => doc(db, 'users', userId, name, id);

  useEffect(() => {
    if (!userId) return;
    let loaded = 0;
    const onLoad = () => { loaded++; if (loaded === 5) setLoading(false); };

    const unsubs = [
      onSnapshot(col('classes'),  snap => { setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() }))); onLoad(); }),
      onSnapshot(col('students'), snap => { setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))); onLoad(); }),
      onSnapshot(col('subjects'), snap => { setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))); onLoad(); }),
      onSnapshot(col('lessons'),  snap => { setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() }))); onLoad(); }),
      onSnapshot(col('notes'),    snap => { setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))); onLoad(); }),
    ];

    return () => unsubs.forEach(u => u());
  }, [userId]);

  const sortedClasses = [...classes].sort((a, b) =>
    a.name.localeCompare(b.name, 'ko', { numeric: true })
  );

  return {
    classes: sortedClasses, students, subjects, lessons, notes, loading,

    addClass: (name) => addDoc(col('classes'), { name }),
    removeClass: async (id) => {
      await deleteDoc(docRef('classes', id));
      students.filter(s => s.classId === id).forEach(s => deleteDoc(docRef('students', s.id)));
    },

    addStudent: (name, classId, studentId = '') =>
      addDoc(col('students'), { name, classId, ...(studentId && { studentId }) }),
    addStudents: (items, classId) => Promise.all(
      items
        .map(item => typeof item === 'string' ? { name: item, studentId: '' } : item)
        .filter(item => !students.some(s => s.classId === classId && s.name === item.name))
        .map(item => addDoc(col('students'), {
          name: item.name,
          classId,
          ...(item.studentId && { studentId: item.studentId }),
        }))
    ),
    removeStudent: async (id) => {
      await deleteDoc(docRef('students', id));
      notes.filter(n => n.studentId === id).forEach(n => deleteDoc(docRef('notes', n.id)));
    },

    addSubject: (name) => addDoc(col('subjects'), { name }),
    removeSubject: (id) => deleteDoc(docRef('subjects', id)),

    addLesson: async (lesson) => {
      const ref = await addDoc(col('lessons'), lesson);
      return ref.id;
    },
    updateLesson: (id, lesson) => setDoc(docRef('lessons', id), lesson),
    removeLesson: async (id) => {
      await deleteDoc(docRef('lessons', id));
      notes.filter(n => n.lessonId === id).forEach(n => deleteDoc(docRef('notes', n.id)));
    },

    saveNote: async (lessonId, studentId, note) => {
      const existing = notes.find(n => n.lessonId === lessonId && n.studentId === studentId);
      if (existing) {
        await setDoc(docRef('notes', existing.id), { lessonId, studentId, note });
      } else {
        await addDoc(col('notes'), { lessonId, studentId, note });
      }
    },
    removeNote: (id) => deleteDoc(docRef('notes', id)),
  };
}
