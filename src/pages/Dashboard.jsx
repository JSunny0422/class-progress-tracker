export default function Dashboard({ store, navigate }) {
  const recentLessons = [...store.lessons]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">대시보드</h2>
        <p className="text-gray-500 text-sm mt-1">수업 진도 및 과세특 기록 현황</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '총 수업', value: store.lessons.length, color: 'text-blue-600' },
          { label: '등록 학생', value: store.students.length, color: 'text-green-600' },
          { label: '과목', value: store.subjects.length, color: 'text-purple-600' },
          { label: '특기사항', value: store.notes.length, color: 'text-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">최근 수업</h3>
          <button
            onClick={() => navigate('newLesson')}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            + 수업 기록
          </button>
        </div>
        {recentLessons.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">아직 기록된 수업이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {recentLessons.map(lesson => {
              const subject = store.subjects.find(s => s.id === lesson.subjectId);
              const cls = store.classes.find(c => c.id === lesson.classId);
              const noteCount = store.notes.filter(n => n.lessonId === lesson.id).length;
              return (
                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-400 w-24 shrink-0">{lesson.date}</div>
                  <div className="flex-1 text-sm">
                    <span className="font-medium text-gray-700">{subject?.name || '-'}</span>
                    <span className="text-gray-400 mx-1">·</span>
                    <span className="text-gray-500">{cls?.name || '-'}</span>
                    <span className="text-gray-400 mx-1">·</span>
                    <span className="text-gray-600">{lesson.unit}</span>
                  </div>
                  {noteCount > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      특기 {noteCount}건
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
