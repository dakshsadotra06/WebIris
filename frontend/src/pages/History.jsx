import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function History() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    api.get('/api/runs').then(({ data }) => setRuns(data.runs)).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Run history</h1>
      <div className="space-y-3">
        {runs.map((r) => (
          <Link key={r.id} to={`/runs/${r.id}`}
            className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-sky-600">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'running'
                ? 'bg-amber-500/20 text-amber-300'
                : r.status === 'done'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'}`}>
                {r.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-slate-200">🎯 {r.goal}</p>
            <p className="text-xs text-slate-500 truncate mt-1">🌐 {r.url}</p>
          </Link>
        ))}
        {runs.length === 0 && (
          <p className="text-sm text-slate-500">No runs yet. Start one from New Task.</p>
        )}
      </div>
    </div>
  );
}
