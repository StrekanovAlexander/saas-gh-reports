import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 🔹 Интерфейс для временного хранения токенов
interface TokenStore {
  [userId: string]: string;
}

// Временное хранилище токенов (в памяти)
const tokenStore: TokenStore = {};

// 1️⃣ Редирект на GitHub OAuth
router.get('/github', (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:user repo`;
  res.redirect(redirectUrl);
});

// 2️⃣ Callback после авторизации
router.get('/github/callback', async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

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
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token received' });
    }

    // Получение информации о пользователе
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userResponse.data;

    // Сохраняем токен в памяти
    tokenStore[user.id] = accessToken;

    // В реальном проекте → создаем JWT и возвращаем клиенту
    res.json({ user, accessToken });
  } catch (err: any) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// 3️⃣ Endpoint для получения репозиториев
router.get('/github/repos', async (req, res) => {
  const userIds = Object.keys(tokenStore);

  if (userIds.length === 0) {
    return res.status(400).json({ error: 'No user logged in' });
  }

  const firstUserId = userIds[0];
  if (!firstUserId) {
    return res.status(400).json({ error: 'No user ID found' });
  }

  const accessToken = tokenStore[firstUserId];
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token not found for user' });
  }

  try {
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
