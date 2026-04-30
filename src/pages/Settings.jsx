import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

function AddForm({ placeholder, onAdd }) {
  const [value, setValue] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) { onAdd(value.trim()); setValue(''); }
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
        추가
      </button>
    </form>
  );
}

function TagList({ items, onRemove }) {
  if (items.length === 0) return <p className="text-gray-400 text-sm">등록된 항목이 없습니다</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item.id} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
          {item.name}
          <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 ml-1 leading-none">×</button>
        </span>
      ))}
    </div>
  );
}

function ExcelImport({ classId, onImport }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const names = rows
        .map(row => String(row[0] || '').trim())
        .filter(name => name && name !== '이름' && name !== '성명');
      setPreview(names);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleConfirm = () => {
    onImport(preview);
    setPreview(null);
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-xs text-gray-500 mb-2">엑셀 파일로 한꺼번에 추가 (A열에 학생 이름)</p>
      <button
        onClick={() => fileRef.current.click()}
        className="text-sm border border-dashed border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
      >
        엑셀 파일 선택
      </button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />

      {preview && (
        <div className="mt-3 bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-700 mb-2">{preview.length}명 감지됨 — 추가할까요?</p>
          <div className="flex flex-wrap gap-1 mb-3 max-h-28 overflow-auto">
            {preview.map((name, i) => (
              <span key={i} className="text-xs bg-white text-gray-700 px-2 py-0.5 rounded-full border border-blue-200">{name}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleConfirm} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              추가하기
            </button>
            <button onClick={() => setPreview(null)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings({ store }) {
  const [tab, setTab] = useState('classes');
  const [selectedClass, setSelectedClass] = useState('');

  const studentsInClass = store.students.filter(s => s.classId === selectedClass);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">설정</h2>

      <div className="flex gap-0 border-b border-gray-200">
        {[
          { id: 'classes', label: '반 관리' },
          { id: 'students', label: '학생 관리' },
          { id: 'subjects', label: '과목 관리' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {tab === 'classes' && (
          <>
            <h3 className="font-semibold text-gray-700 mb-4">반 목록</h3>
            <TagList items={store.classes} onRemove={store.removeClass} />
            <AddForm placeholder="예: 1학년 2반" onAdd={store.addClass} />
          </>
        )}

        {tab === 'students' && (
          <>
            <h3 className="font-semibold text-gray-700 mb-4">학생 관리</h3>
            <div className="mb-4">
              <label className="text-sm text-gray-600 font-medium">반 선택</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="mt-1 block w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">반을 선택하세요</option>
                {store.classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedClass ? (
              <>
                <TagList items={studentsInClass} onRemove={store.removeStudent} />
                <AddForm placeholder="학생 이름 (개별 추가)" onAdd={(name) => store.addStudent(name, selectedClass)} />
                <ExcelImport classId={selectedClass} onImport={(names) => store.addStudents(names, selectedClass)} />
              </>
            ) : (
              <p className="text-gray-400 text-sm">반을 먼저 선택해 주세요</p>
            )}
          </>
        )}

        {tab === 'subjects' && (
          <>
            <h3 className="font-semibold text-gray-700 mb-4">과목 목록</h3>
            <TagList items={store.subjects} onRemove={store.removeSubject} />
            <AddForm placeholder="예: 수학, 국어, 영어" onAdd={store.addSubject} />
          </>
        )}
      </div>
    </div>
  );
}
