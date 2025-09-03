import React from 'react';
import api from '../services/api';

const ReportPage: React.FC = () => {
  const downloadReport = async () => {
    const response = await api.get('/report', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.pdf'); // или report.xlsx
    document.body.appendChild(link);
    link.click();
  };

  return <button onClick={downloadReport}>Download PDF/Excel Report</button>;
};

export default ReportPage;