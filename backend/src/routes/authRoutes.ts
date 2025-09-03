import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// 🔹 Временное хранилище токенов GitHub по userId
interface TokenStore {
  [userId: string]: string;
}
const tokenStore: TokenStore = {};

// 1️⃣ Редирект на GitHub OAuth
router.get('/github', (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:user repo`;
  res.redirect(redirectUrl);
});

// 2️⃣ Callback после авторизации
router.get('/github/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    // Обмен кода на access_token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).json({ error: 'No access token received' });

    // Получение информации о пользователе
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userResponse.data;

    // Сохраняем GitHub токен
    tokenStore[user.id] = accessToken;

    // Создаем JWT
    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // 🔹 Редирект на frontend с токеном
    const frontendUrl = `http://localhost:3000?token=${jwtToken}`;
    res.redirect(frontendUrl);

  } catch (err: any) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// 3️⃣ Endpoint для проверки авторизации
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    if (!tokenStore[userId]) return res.status(401).json({ error: 'Invalid token' });

    res.json({ userId });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// 4️⃣ Endpoint для получения репозиториев GitHub
router.get('/github/repos', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const accessToken = tokenStore[userId];
    if (!accessToken) return res.status(401).json({ error: 'Invalid token' });

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json(response.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});


export default router;
