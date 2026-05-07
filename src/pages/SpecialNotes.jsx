import { useState } from 'react';
import * as XLSX from 'xlsx';

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

  const handleStudentExcel = () => {
    const student = store.students.find(s => s.id === selectedStudent);
    const rows = [['날짜', '과목', '단원', '특기사항']];
    studentNotes.forEach(n => {
      rows.push([n.lesson?.date ?? '', n.subject?.name ?? '', n.lesson?.unit ?? '', n.note]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 24 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, student?.name ?? '학생');
    XLSX.writeFile(wb, `${student?.name ?? '학생'}_과세특.xlsx`);
  };

  const handleClassExcel = () => {
    const cls = store.classes.find(c => c.id === selectedClass);
    const wb = XLSX.utils.book_new();

    studentsInClass.forEach(student => {
      const sNotes = store.notes
        .filter(n => n.studentId === student.id)
        .map(n => {
          const lesson = store.lessons.find(l => l.id === n.lessonId);
          const subject = store.subjects.find(s => s.id === lesson?.subjectId);
          return { ...n, lesson, subject };
        })
        .sort((a, b) => new Date(a.lesson?.date) - new Date(b.lesson?.date));

      if (sNotes.length === 0) return;

      const rows = [['날짜', '과목', '단원', '특기사항']];
      sNotes.forEach(n => {
        rows.push([n.lesson?.date ?? '', n.subject?.name ?? '', n.lesson?.unit ?? '', n.note]);
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 24 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, ws, student.name);
    });

    if (wb.SheetNames.length === 0) {
      alert('이 반에 기록된 특기사항이 없습니다.');
      return;
    }

    XLSX.writeFile(wb, `${cls?.name ?? '반'}_과세특.xlsx`);
  };

  const student = store.students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">과세특 정리</h2>
        <p className="text-gray-500 text-sm mt-1">학생별 특기사항을 모아서 확인하고 복사하세요</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">반 선택</option>
          {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedClass && (
          <>
            <select
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">학생 선택</option>
              {studentsInClass.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentId ? `${s.studentId} ${s.name}` : s.name} ({store.notes.filter(n => n.studentId === s.id).length}건)
                </option>
              ))}
            </select>
            <button
              onClick={handleClassExcel}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors font-medium"
            >
              <span>↓</span> 반 전체 엑셀
            </button>
          </>
        )}
      </div>

      {selectedStudent ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">
              {student ? (student.studentId ? `${student.studentId} ${student.name}` : student.name) : ''} — 특기사항 {studentNotes.length}건
            </h3>
            {studentNotes.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleStudentExcel}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors font-medium"
                >
                  <span>↓</span> 엑셀 다운로드
                </button>
                <button
                  onClick={handleCopy}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors font-medium ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {copied ? '복사됨!' : '전체 복사'}
                </button>
              </div>
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
