const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db');

const router = express.Router();

function sign(id) {
  return jwt.sign({ sub: id }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: hash })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ token: sign(data.id) });
  } catch (e) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('email', email)
      .single();
    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    return res.json({ token: sign(user.id) });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
