import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/api/auth/${mode}`, { email, password });
      localStorage.setItem('webiris_token', data.token);
      navigate('/new');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center px-4 pt-20">
      <form onSubmit={submit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Web<span className="text-sky-400">Iris</span></h1>
        <p className="text-sm text-slate-400">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input className="w-full bg-slate-800 rounded px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500"
          placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full bg-slate-800 rounded px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500"
          placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded py-2 text-sm">
          {mode === 'login' ? 'Log in' : 'Register'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-xs text-slate-400 hover:text-sky-300">
          {mode === 'login' ? 'No account? Register' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  );
}
