
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function App() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([
    { SLoc: 'US10', Total: 92, Batch: 89 },
    { SLoc: 'BU90', Total: 95, Batch: 94 },
    { SLoc: 'US40', Total: 88, Batch: 84 }
  ]);

  useEffect(() => {
    fetch('sample_inventory.xlsx')
      .then(res => res.arrayBuffer())
      .then(ab => {
        const wb = XLSX.read(ab, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        setData(jsonData);
      });
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <h1>📦 Inventory Dashboard</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <div style={{ width: '100%', height: 400, marginTop: '2rem' }}>
        <h2>📊 Alignment by SLoc</h2>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="SLoc" />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total" fill="#8884d8" name="Total Alignment %" />
            <Bar dataKey="Batch" fill="#82ca9d" name="Batch Alignment %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>📋 Data Preview</h2>
          <table border="1" cellPadding="5">
            <tbody>
              {data.slice(0, 10).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
