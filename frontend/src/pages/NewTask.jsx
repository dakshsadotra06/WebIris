import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PRESETS = [
  {
    label: 'Fill the demo registration form',
    goal: 'Fill the registration form with name Aarav Sharma, email aarav@test.com, phone 9810012345, select course B.Tech, then submit it',
    url: () => window.location.origin + '/demo-form',
  },
  {
    label: 'Find the contact email',
    goal: 'Find the contact email address shown on this page',
    url: () => 'https://example.com',
  },
];

export default function NewTask() {
  const [goal, setGoal] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const pick = (p) => { setGoal(p.goal); setUrl(p.url()); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/api/runs', { goal, url });
      navigate(`/runs/${data.run.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start run');
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10">
      <h1 className="text-2xl font-bold mb-1">New agent task</h1>
      <p className="text-sm text-slate-400 mb-6">
        Describe the goal in plain language. WebIris will operate the browser until it is done.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => pick(p)}
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full px-3 py-1.5">
            {p.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div>
          <label className="text-xs text-slate-400">Goal</label>
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} required rows={4}
            placeholder="e.g. Fill the registration form and submit it"
            className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Start URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://…"
            className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500" />
        </div>
        <button disabled={busy}
          className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg px-6 py-2.5 text-sm">
          {busy ? 'Launching agent…' : 'Run agent'}
        </button>
      </form>
    </div>
  );
}
