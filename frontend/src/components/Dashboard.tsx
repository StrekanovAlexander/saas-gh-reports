import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface RepoData {
  name: string;
  stargazers_count: number;
}

const Dashboard: React.FC = () => {
  const [repos, setRepos] = useState<RepoData[]>([]);

  useEffect(() => {
    api.get('/github/repos') // создадим этот endpoint на backend
      .then(res => setRepos(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Your Repositories</h2>
      <BarChart width={600} height={300} data={repos}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="stargazers_count" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default Dashboard;
