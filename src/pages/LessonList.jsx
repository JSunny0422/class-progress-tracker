import { useState } from 'react';

export default function LessonList({ store }) {
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [expanded, setExpanded] = useState(null);

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

            return (
              <div key={lesson.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : lesson.id)}
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
                                <span className="text-xs font-semibold text-gray-600 w-16 shrink-0">{student?.name || '-'}</span>
                                <span className="text-xs text-gray-700 flex-1">{note.note}</span>
                                <button onClick={() => store.removeNote(note.id)} className="text-gray-300 hover:text-red-400 text-xs shrink-0">×</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => store.removeLesson(lesson.id)}
                      className="text-xs text-red-400 hover:text-red-600 mt-1"
                    >
                      수업 삭제
                    </button>
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
