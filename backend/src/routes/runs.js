const express = require('express');
const auth = require('../middleware/auth');
const { supabase } = require('../db');
const { runAgent } = require('../agent/runner');

const router = express.Router();
router.use(auth);

// Start a new agent run (fire-and-forget: the agent works in the background)
router.post('/', async (req, res) => {
  const { goal, url } = req.body || {};
  if (!goal || !url) return res.status(400).json({ error: 'goal and url required' });
  if (process.env.DISABLE_AGENT === 'true') {
   return res.status(503).json({ error: 'Live agent runs are off on the deployed demo (no browser here). See the demo video for a full run.' });
}

  const { data: run, error } = await supabase
    .from('runs')
    .insert({ user_id: req.userId, goal, url, status: 'running' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  runAgent(run.id, goal, url, supabase).catch((e) =>
    console.error('agent run failed:', e.message)
  );

  return res.status(201).json({ run });
});

// List my runs, newest first
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ runs: data });
});

// One run + its steps (ownership checked)
router.get('/:id', async (req, res) => {
  const { data: run, error } = await supabase
    .from('runs')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();
  if (error || !run) return res.status(404).json({ error: 'Run not found' });

  const { data: steps } = await supabase
    .from('steps')
    .select('*')
    .eq('run_id', run.id)
    .order('n', { ascending: true });

  return res.json({ run, steps: steps || [] });
});

module.exports = router;
