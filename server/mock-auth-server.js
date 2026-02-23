const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Simple CORS for local dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const users = [
  { id: '1', email: 'test@example.com', name: 'Test User', password: 'password123' }
];

function base64urlEncode(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function makeToken(user) {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour
  };
  return `${base64urlEncode(header)}.${base64urlEncode(payload)}.signature`;
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = makeToken(user);
  const refreshToken = `refresh-${user.id}-${Date.now()}`;

  return res.json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields required' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const newUser = { id: String(Date.now()), email, name, password };
  users.push(newUser);
  const token = makeToken(newUser);
  const refreshToken = `refresh-${newUser.id}-${Date.now()}`;
  return res.status(201).json({ token, refreshToken, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
  const parts = refreshToken.split('-');
  const userId = parts[1];
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
  const token = makeToken(user);
  const newRefreshToken = `refresh-${user.id}-${Date.now()}`;
  return res.json({ token, refreshToken: newRefreshToken, user: { id: user.id, email: user.email, name: user.name } });
});

// Forgot password endpoint (mock)
app.post('/api/auth/forgot', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: 'Email required' });
  // In a real app, we'd send an email. Here we just respond with success.
  return res.json({ message: 'If the email exists, reset instructions were sent.' });
});

app.listen(port, () => {
  console.log(`Mock auth server running on http://localhost:${port}`);
});
