import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
// console.log(process.env.GITHUB_CLIENT_ID);

// Step 1: Redirect user to GitHub OAuth page
router.get('/github', (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:user repo`;
  res.redirect(redirectUrl);
});

// Step 2: GitHub redirects back with "code"
router.get('/github/callback', async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // обмен кода на токен
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

    // запрос информации о пользователе
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userResponse.data;

    // пока просто выводим результат
    return res.json({ user, accessToken });
  } catch (err: any) {
    console.error('OAuth error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'OAuth failed' });
  }
});

export default router;