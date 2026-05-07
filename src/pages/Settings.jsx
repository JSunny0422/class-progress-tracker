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

function TagList({ items, onRemove, getLabel }) {
  if (items.length === 0) return <p className="text-gray-400 text-sm">등록된 항목이 없습니다</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item.id} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
          {getLabel ? getLabel(item) : item.name}
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

function parseStudentId(idStr) {
  const id = String(idStr).replace(/\s/g, '');
  if (id.length === 4 && /^\d{4}$/.test(id)) {
    return { grade: parseInt(id[0]), classNum: parseInt(id[1]) };
  }
  if (id.length === 5 && /^\d{5}$/.test(id)) {
    return { grade: parseInt(id.slice(0, 2)), classNum: parseInt(id[2]) };
  }
  return null;
}

function findMatchingClass(grade, classNum, classes) {
  return classes.find(c => {
    const nums = c.name.match(/\d+/g)?.map(Number) || [];
    return nums.includes(grade) && nums.includes(classNum);
  }) || null;
}

function GradeImport({ store }) {
  const fileRef = useRef();
  const [groups, setGroups] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const firstRow = rows[0]?.map(c => String(c ?? '').trim()) ?? [];
      const idColIdx = firstRow.findIndex(c => c.includes('학번') || c.includes('번호'));
      const nameColIdx = firstRow.findIndex(c => c.includes('이름') || c.includes('성명'));
      const hasHeader = idColIdx >= 0 || nameColIdx >= 0;
      const idCol = idColIdx >= 0 ? idColIdx : 0;
      const nameCol = nameColIdx >= 0 ? nameColIdx : 1;
      const dataRows = hasHeader ? rows.slice(1) : rows;

      const students = dataRows
        .map(row => ({
          studentId: String(row[idCol] ?? '').trim(),
          name: String(row[nameCol] ?? '').trim(),
        }))
        .filter(s => s.name && parseStudentId(s.studentId));

      if (students.length === 0) {
        alert('학번/이름 데이터를 찾을 수 없습니다.\n파일에 학번 열과 이름 열이 있어야 합니다.');
        e.target.value = '';
        return;
      }

      const groupMap = {};
      students.forEach(s => {
        const parsed = parseStudentId(s.studentId);
        const key = `${parsed.grade}-${parsed.classNum}`;
        if (!groupMap[key]) {
          const matched = findMatchingClass(parsed.grade, parsed.classNum, store.classes);
          groupMap[key] = {
            grade: parsed.grade,
            classNum: parsed.classNum,
            classId: matched?.id ?? null,
            finalName: matched?.name ?? `${parsed.grade}학년 ${parsed.classNum}반`,
            isNew: !matched,
            students: [],
          };
        }
        groupMap[key].students.push(s);
      });

      setGroups(
        Object.values(groupMap).sort((a, b) =>
          a.grade !== b.grade ? a.grade - b.grade : a.classNum - b.classNum
        )
      );
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const updateName = (idx, name) => {
    setGroups(prev => prev.map((g, i) => i === idx ? { ...g, finalName: name } : g));
  };

  const handleImport = async () => {
    setImporting(true);
    for (const group of groups) {
      let classId = group.classId;
      if (!classId) {
        const ref = await store.addClass(group.finalName);
        classId = ref.id;
      }
      await store.addStudents(group.students.map(s => ({ name: s.name, studentId: s.studentId })), classId);
    }
    setImporting(false);
    setGroups(null);
  };

  const newCount = groups?.filter(g => g.isNew).length ?? 0;
  const totalStudents = groups?.reduce((s, g) => s + g.students.length, 0) ?? 0;

  return (
    <div className="mt-5 pt-5 border-t border-gray-100">
      <p className="text-sm font-semibold text-gray-700 mb-1">엑셀 파일로 반·학생 한꺼번에 가져오기</p>
      <p className="text-xs text-gray-500 mb-3">
        학번과 이름이 있는 파일을 올리면 학번 기준으로 반을 자동 생성하고 학생을 추가합니다
        <span className="ml-1 text-gray-400">(예: 2101 → 2학년 1반)</span>
      </p>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
      <button
        onClick={() => fileRef.current.click()}
        className="text-sm border border-dashed border-indigo-300 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50"
      >
        학년 전체 엑셀 파일 선택
      </button>

      {groups && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-gray-500">
            총 <span className="font-medium text-gray-700">{totalStudents}명</span> 감지 —
            {newCount > 0 && <span className="text-indigo-600 ml-1">새 반 {newCount}개 생성 예정</span>}
            {newCount < groups.length && <span className="text-green-600 ml-1">기존 반 {groups.length - newCount}개에 추가</span>}
          </p>

          {groups.map((group, idx) => (
            <div
              key={idx}
              className={`border rounded-xl p-3 ${group.isNew ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  group.isNew ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                }`}>
                  {group.isNew ? '새 반' : '기존 반'}
                </span>
                <span className="text-xs text-gray-400">학번 {group.grade}학년 {group.classNum}반</span>
                <span className="text-xs text-gray-400">→ 반 이름:</span>
                <input
                  value={group.finalName}
                  onChange={e => updateName(idx, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-32"
                />
                <span className="text-xs text-gray-400">({group.students.length}명)</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {group.students.map((s, i) => (
                  <span key={i} className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                    {s.studentId} {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleImport}
              disabled={importing}
              className="text-sm bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing ? '가져오는 중...' : `반 ${groups.length}개 · 학생 ${totalStudents}명 가져오기`}
            </button>
            <button
              onClick={() => setGroups(null)}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
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
            <GradeImport store={store} />
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
                <TagList
                  items={studentsInClass}
                  onRemove={store.removeStudent}
                  getLabel={s => s.studentId ? `${s.studentId} ${s.name}` : s.name}
                />
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
