// frontend/src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Dashboard from '../components/Dashboard';
import LoginButton from '../components/LoginButton';

const HomePage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 1️⃣ Проверяем token в query params после редиректа с GitHub
    const params = new URLSearchParams(window.location.search);
    const tokenFromQuery = params.get('token');

    if (tokenFromQuery) {
      localStorage.setItem('token', tokenFromQuery);
      setToken(tokenFromQuery);
      setLoggedIn(true);

      // очищаем URL от query, чтобы токен не висел
      window.history.replaceState({}, '', '/');
      return;
    }

    // 2️⃣ Если токена нет в query, проверяем localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      api.get('/auth/me', { headers: { Authorization: `Bearer ${storedToken}` } })
        .then(() => {
          setLoggedIn(true);
          setToken(storedToken);
        })
        .catch(() => {
          setLoggedIn(false);
          setToken(null);
          localStorage.removeItem('token');
        });
    }
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div>
      {loggedIn ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <Dashboard token={token!} />
        </>
      ) : (
        <LoginButton />
      )}
    </div>
  );
};

export default HomePage;
