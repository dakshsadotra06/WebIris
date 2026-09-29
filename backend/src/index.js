require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Serve the public dir statically (agent screenshots live under /shots/<runId>/)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/runs', require('./routes/runs'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'webiris-backend' }));

app.listen(PORT, () => console.log(`WebIris backend listening on port ${PORT}`));
