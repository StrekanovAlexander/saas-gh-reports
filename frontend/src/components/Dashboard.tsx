// frontend/src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface RepoData {
  name: string;
  stargazers_count: number;
}

interface DashboardProps {
  token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [repos, setRepos] = useState<RepoData[]>([]);

  useEffect(() => {
    axios.get('http://localhost:4000/auth/github/repos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setRepos(res.data))
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div>
      <h2>Your Repositories</h2>
      {repos.length === 0 ? (
        <p>No repositories found.</p>
      ) : (
        <BarChart width={600} height={300} data={repos}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="stargazers_count" fill="#8884d8" />
        </BarChart>
      )}
    </div>
  );
};

export default Dashboard;
