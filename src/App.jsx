import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useStore } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import NewLesson from './pages/NewLesson';
import LessonList from './pages/LessonList';
import SpecialNotes from './pages/SpecialNotes';
import Login from './pages/Login';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const store = useStore(user?.uid);

  if (user === undefined || (user && store.loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    );
  }

  if (!user) return <Login />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard store={store} navigate={setPage} />;
      case 'settings':     return <Settings store={store} />;
      case 'newLesson':    return <NewLesson store={store} navigate={setPage} />;
      case 'lessons':      return <LessonList store={store} />;
      case 'specialNotes': return <SpecialNotes store={store} />;
      default:             return <Dashboard store={store} navigate={setPage} />;
    }
  };

  return (
    <Layout page={page} navigate={setPage} user={user} onLogout={() => signOut(auth)}>
      {renderPage()}
    </Layout>
  );
}
