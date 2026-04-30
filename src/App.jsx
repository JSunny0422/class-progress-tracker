import { useState } from 'react';
import { useStore } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import NewLesson from './pages/NewLesson';
import LessonList from './pages/LessonList';
import SpecialNotes from './pages/SpecialNotes';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const store = useStore();

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
    <Layout page={page} navigate={setPage}>
      {renderPage()}
    </Layout>
  );
}
