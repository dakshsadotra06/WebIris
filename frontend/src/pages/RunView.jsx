import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const API = import.meta.env.VITE_API_URL;

const ACTION_COLORS = {
  click: 'bg-blue-500/20 text-blue-300',
  fill: 'bg-emerald-500/20 text-emerald-300',
  select: 'bg-violet-500/20 text-violet-300',
  scroll: 'bg-slate-500/20 text-slate-300',
  navigate: 'bg-amber-500/20 text-amber-300',
  wait: 'bg-slate-500/20 text-slate-400',
  complete: 'bg-green-500/20 text-green-300',
  fail: 'bg-red-500/20 text-red-300',
};

export default function RunView() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    let alive = true;
    let timer;
    const fetchRun = async () => {
      try {
        const { data } = await api.get(`/api/runs/${id}`);
        if (!alive) return;
        setRun(data.run);
        setSteps(data.steps);
        if (data.run.status === 'running') timer = setTimeout(fetchRun, 2000);
      } catch (e) {
        if (alive) timer = setTimeout(fetchRun, 3000);
      }
    };
    fetchRun();
    return () => { alive = false; clearTimeout(timer); };
  }, [id]);

  if (!run) return <p className="p-8 text-slate-400 text-sm">Loading run…</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold">Agent run</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full ${run.status === 'running'
            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
            : run.status === 'done'
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'}`}>
            {run.status.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-slate-300">🎯 {run.goal}</p>
        <p className="text-xs text-slate-500 mt-1 truncate">🌐 {run.url}</p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono text-slate-500">STEP {s.n}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[s.action?.action] || 'bg-slate-700 text-slate-300'}`}>
                {s.action?.action?.toUpperCase()}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.valid ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {s.valid ? 'VALID' : 'BLOCKED'}
              </span>
              {s.action?.targetRef && (
                <span className="text-xs font-mono text-slate-500">→ {s.action.targetRef}</span>
              )}
            </div>
            <p className="text-sm text-slate-300 mb-3">{s.reasoning}</p>
            {s.screenshot_path && (
              <img src={API + s.screenshot_path} alt={`Step ${s.n}`}
                className="rounded-lg border border-slate-800 w-full" />
            )}
          </div>
        ))}
        {run.status === 'running' && steps.length === 0 && (
          <p className="text-sm text-slate-500 animate-pulse">Agent is perceiving the page…</p>
        )}
      </div>
    </div>
  );
}
