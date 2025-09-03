import React from 'react';
import LoginButton from '../components/LoginButton';
import Dashboard from '../components/Dashboard';

const HomePage: React.FC = () => {
  const loggedIn = false; // проверка через JWT или сессию

  return (
    <div>
      {loggedIn ? <Dashboard /> : <LoginButton />}
    </div>
  );
};

export default HomePage;