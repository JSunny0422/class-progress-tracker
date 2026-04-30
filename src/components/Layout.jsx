const navItems = [
  { id: 'dashboard', label: '대시보드', icon: '🏠' },
  { id: 'newLesson', label: '수업 기록', icon: '✏️' },
  { id: 'lessons', label: '수업 목록', icon: '📋' },
  { id: 'specialNotes', label: '과세특 정리', icon: '⭐' },
  { id: 'settings', label: '설정', icon: '⚙️' },
];

export default function Layout({ children, page, navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-base font-bold text-blue-700">수업 진도 관리</h1>
          <p className="text-xs text-gray-400 mt-0.5">과세특 기록 시스템</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                page === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
