import { useState } from 'react';

export default function SpecialNotes({ store }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [copied, setCopied] = useState(false);

  const studentsInClass = store.students.filter(s => s.classId === selectedClass);

  const studentNotes = store.notes
    .filter(n => n.studentId === selectedStudent)
    .map(n => {
      const lesson = store.lessons.find(l => l.id === n.lessonId);
      const subject = store.subjects.find(s => s.id === lesson?.subjectId);
      return { ...n, lesson, subject };
    })
    .sort((a, b) => new Date(a.lesson?.date) - new Date(b.lesson?.date));

  const copyText = studentNotes
    .map(n => `[${n.lesson?.date} ${n.subject?.name} ${n.lesson?.unit}] ${n.note}`)
    .join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const student = store.students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">과세특 정리</h2>
        <p className="text-gray-500 text-sm mt-1">학생별 특기사항을 모아서 확인하고 복사하세요</p>
      </div>

      <div className="flex gap-3">
        <select
          value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">반 선택</option>
          {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedClass && (
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">학생 선택</option>
            {studentsInClass.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({store.notes.filter(n => n.studentId === s.id).length}건)
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedStudent ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">
              {student?.name} — 특기사항 {studentNotes.length}건
            </h3>
            {studentNotes.length > 0 && (
              <button
                onClick={handleCopy}
                className={`text-sm px-4 py-2 rounded-lg transition-colors font-medium ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {copied ? '복사됨!' : '전체 복사'}
              </button>
            )}
          </div>

          {studentNotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400 text-sm">이 학생의 특기사항이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentNotes.map(n => (
                <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">{n.lesson?.date}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{n.subject?.name}</span>
                    <span className="text-xs text-gray-500">{n.lesson?.unit}</span>
                  </div>
                  <p className="text-sm text-gray-700">{n.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">반과 학생을 선택하면 특기사항이 표시됩니다</p>
        </div>
      )}
    </div>
  );
}
