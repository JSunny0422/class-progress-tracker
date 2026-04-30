import { useState } from 'react';

export default function NewLesson({ store, navigate }) {
  const today = new Date().toISOString().split('T')[0];
  const [step, setStep] = useState(1);
  const [lessonId, setLessonId] = useState(null);
  const [form, setForm] = useState({
    date: today,
    subjectId: '',
    classId: '',
    unit: '',
    content: '',
  });
  const [notes, setNotes] = useState({});

  const handleLessonSubmit = (e) => {
    e.preventDefault();
    const id = store.addLesson(form);
    setLessonId(id);
    setStep(2);
  };

  const handleNoteChange = (studentId, value) => {
    setNotes(n => ({ ...n, [studentId]: value }));
  };

  const handleSaveNotes = () => {
    Object.entries(notes).forEach(([studentId, note]) => {
      if (note.trim()) store.saveNote(lessonId, studentId, note.trim());
    });
    navigate('lessons');
  };

  const studentsInClass = store.students.filter(s => s.classId === form.classId);

  if (step === 1) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">수업 기록</h2>
          <p className="text-gray-500 text-sm mt-1">오늘 수업 내용을 입력하세요</p>
        </div>
        <form onSubmit={handleLessonSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">날짜</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">과목</label>
              <select
                required
                value={form.subjectId}
                onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">선택</option>
                {store.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">반</label>
              <select
                required
                value={form.classId}
                onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">선택</option>
                {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">단원</label>
              <input
                required
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="예: 2단원 - 함수의 극한"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">수업 내용</label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="오늘 수업에서 다룬 주요 내용을 입력하세요"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            다음: 학생 특기사항 입력 →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">학생 특기사항</h2>
        <p className="text-gray-500 text-sm mt-1">인상깊은 학생 활동을 기록하세요 (선택사항, 없으면 비워두세요)</p>
      </div>
      {studentsInClass.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-sm">이 반에 등록된 학생이 없습니다</p>
          <p className="text-gray-400 text-xs mt-1">설정에서 학생을 먼저 등록해 주세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {studentsInClass.map(student => (
            <div key={student.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="text-sm font-semibold text-gray-700">{student.name}</label>
              <textarea
                rows={2}
                value={notes[student.id] || ''}
                onChange={e => handleNoteChange(student.id, e.target.value)}
                placeholder="특기사항 없으면 비워두세요"
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={handleSaveNotes} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
          저장 완료
        </button>
        <button onClick={() => navigate('lessons')} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          건너뛰기
        </button>
      </div>
    </div>
  );
}
