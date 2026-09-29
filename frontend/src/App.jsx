import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import NewTask from './pages/NewTask';
import RunView from './pages/RunView';
import History from './pages/History';
import DemoForm from './pages/DemoForm';

function Guard({ children }) {
  const token = localStorage.getItem('webiris_token');
  return token ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const navigate = useNavigate();
  const token = localStorage.getItem('webiris_token');
  const logout = () => {
    localStorage.removeItem('webiris_token');
    navigate('/login');
  };
  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between">
      <Link to="/new" className="text-xl font-bold tracking-tight">
        Web<span className="text-sky-400">Iris</span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {token && (
          <>
            <Link to="/new" className="hover:text-sky-300">New Task</Link>
            <Link to="/history" className="hover:text-sky-300">History</Link>
            <Link to="/demo-form" className="hover:text-sky-300">Demo Form</Link>
            <button onClick={logout} className="text-slate-400 hover:text-white">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/demo-form" element={<DemoForm />} />
        <Route path="/new" element={<Guard><NewTask /></Guard>} />
        <Route path="/runs/:id" element={<Guard><RunView /></Guard>} />
        <Route path="/history" element={<Guard><History /></Guard>} />
        <Route path="*" element={<Navigate to="/new" replace />} />
      </Routes>
    </div>
  );
}
