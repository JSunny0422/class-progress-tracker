import { useState } from 'react';

function EditForm({ lesson, store, onClose }) {
  const [form, setForm] = useState({
    date: lesson.date,
    subjectId: lesson.subjectId,
    classId: lesson.classId,
    unit: lesson.unit,
    content: lesson.content,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await store.updateLesson(lesson.id, form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-blue-600">수업 수정</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">날짜</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">과목</label>
          <select
            value={form.subjectId}
            onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {store.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">반</label>
          <select
            value={form.classId}
            onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">단원</label>
          <input
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500">수업 내용</label>
        <textarea
          rows={4}
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">
          저장
        </button>
        <button type="button" onClick={onClose} className="text-xs text-gray-500 px-4 py-1.5 rounded-lg hover:bg-gray-100">
          취소
        </button>
      </div>
    </form>
  );
}

function StudentNotesEditor({ lesson, store, onClose }) {
  const studentsInClass = store.students.filter(s => s.classId === lesson.classId);
  const existingNotes = store.notes.filter(n => n.lessonId === lesson.id);

  const [notes, setNotes] = useState(() => {
    const init = {};
    existingNotes.forEach(n => { init[n.studentId] = n.note; });
    return init;
  });

  const handleSave = async () => {
    for (const student of studentsInClass) {
      const note = (notes[student.id] || '').trim();
      const existing = existingNotes.find(n => n.studentId === student.id);
      if (note) {
        await store.saveNote(lesson.id, student.id, note);
      } else if (existing) {
        await store.removeNote(existing.id);
      }
    }
    onClose();
  };

  if (studentsInClass.length === 0) {
    return (
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">이 반에 등록된 학생이 없습니다. 설정에서 학생을 먼저 등록해 주세요.</p>
        <button onClick={onClose} className="mt-2 text-xs text-gray-500 px-4 py-1.5 rounded-lg hover:bg-gray-100">닫기</button>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-gray-100 space-y-3">
      <p className="text-xs font-medium text-blue-600">학생 특기사항 편집</p>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {studentsInClass.map(student => (
          <div key={student.id} className="flex gap-2 items-start">
            <span className="text-xs font-semibold text-gray-600 w-24 shrink-0 pt-2">
              {student.studentId ? `${student.studentId} ${student.name}` : student.name}
            </span>
            <textarea
              rows={2}
              value={notes[student.id] || ''}
              onChange={e => setNotes(n => ({ ...n, [student.id]: e.target.value }))}
              placeholder="특기사항 없으면 비워두세요"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">
          저장
        </button>
        <button onClick={onClose} className="text-xs text-gray-500 px-4 py-1.5 rounded-lg hover:bg-gray-100">
          취소
        </button>
      </div>
    </div>
  );
}

export default function LessonList({ store }) {
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);

  const filtered = [...store.lessons]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(l =>
      (!filterSubject || l.subjectId === filterSubject) &&
      (!filterClass || l.classId === filterClass)
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">수업 목록</h2>

      <div className="flex gap-3">
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">전체 과목</option>
          {store.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">전체 반</option>
          {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">기록된 수업이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(lesson => {
            const subject = store.subjects.find(s => s.id === lesson.subjectId);
            const cls = store.classes.find(c => c.id === lesson.classId);
            const lessonNotes = store.notes.filter(n => n.lessonId === lesson.id);
            const isExpanded = expanded === lesson.id;
            const isEditing = editing === lesson.id;
            const isEditingNotes = editingNotes === lesson.id;

            return (
              <div key={lesson.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => {
                    setExpanded(isExpanded ? null : lesson.id);
                    setEditing(null);
                    setEditingNotes(null);
                  }}
                  className="w-full text-left p-4 hover:bg-gray-50 flex items-center gap-3"
                >
                  <span className="text-sm text-gray-400 w-24 shrink-0">{lesson.date}</span>
                  <span className="text-sm font-medium text-blue-600 w-16 shrink-0">{subject?.name || '-'}</span>
                  <span className="text-sm text-gray-500 w-20 shrink-0">{cls?.name || '-'}</span>
                  <span className="text-sm text-gray-700 flex-1 truncate">{lesson.unit}</span>
                  {lessonNotes.length > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0">
                      특기 {lessonNotes.length}건
                    </span>
                  )}
                  <span className="text-gray-400 text-xs ml-2">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    {isEditing ? (
                      <EditForm lesson={lesson} store={store} onClose={() => setEditing(null)} />
                    ) : isEditingNotes ? (
                      <StudentNotesEditor lesson={lesson} store={store} onClose={() => setEditingNotes(null)} />
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">수업 내용</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
                        </div>
                        {lessonNotes.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">학생 특기사항</p>
                            <div className="space-y-1.5">
                              {lessonNotes.map(note => {
                                const student = store.students.find(s => s.id === note.studentId);
                                return (
                                  <div key={note.id} className="flex gap-2 bg-yellow-50 rounded-lg p-2.5">
                                    <span className="text-xs font-semibold text-gray-600 w-24 shrink-0">
                                      {student ? (student.studentId ? `${student.studentId} ${student.name}` : student.name) : '-'}
                                    </span>
                                    <span className="text-xs text-gray-700 flex-1">{note.note}</span>
                                    <button onClick={() => store.removeNote(note.id)} className="text-gray-300 hover:text-red-400 text-xs shrink-0">×</button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => setEditing(lesson.id)}
                            className="text-xs text-blue-500 hover:text-blue-700"
                          >
                            수업 수정
                          </button>
                          <button
                            onClick={() => setEditingNotes(lesson.id)}
                            className="text-xs text-yellow-600 hover:text-yellow-800"
                          >
                            특기사항 편집
                          </button>
                          <button
                            onClick={() => store.removeLesson(lesson.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            수업 삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
