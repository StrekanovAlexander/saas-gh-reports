// frontend/src/components/LoginButton.tsx
import React from 'react';

const LoginButton: React.FC = () => {
  return (
    <a href="http://localhost:4000/auth/github">
      <button>Login with GitHub</button>
    </a>
  );
};

export default LoginButton;
