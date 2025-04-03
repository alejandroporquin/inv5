
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
  const [alignmentData, setAlignmentData] = useState([]);
  const [goodData, setGoodData] = useState([]);
  const [selectedSLoc, setSelectedSLoc] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      // Parse alignment summary
      const alignmentSheet = wb.Sheets["Alignment Summary"];
      const alignmentJson = XLSX.utils.sheet_to_json(alignmentSheet);
      const aligned = alignmentJson.map(row => ({
        SLoc: row["SLoc"],
        Total: row["Alignment %"] ? Number(row["Alignment %"]) : 0,
        Batch: row["Batch Alignment %"] ? Number(row["Batch Alignment %"]) : 0
      }));
      setAlignmentData(aligned);

      // Parse good data
      const goodDataSheet = wb.Sheets["Good Data"];
      const goodJson = XLSX.utils.sheet_to_json(goodDataSheet);
      setGoodData(goodJson);
    };
    reader.readAsBinaryString(file);
  };

  const handleBarClick = (data) => {
    if (data && data.activeLabel) {
      setSelectedSLoc(data.activeLabel);
    }
  };

  const filteredGoodData = selectedSLoc
    ? goodData.filter(row => row["SLoc"] === selectedSLoc)
    : [];

  return (
    <div>
      <h1>📦 Inventory Dashboard</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {alignmentData.length > 0 && (
        <div style={{ width: '100%', height: 400, marginTop: '2rem' }}>
          <h2>📊 Alignment by SLoc</h2>
          <ResponsiveContainer>
            <BarChart
              data={alignmentData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              onClick={handleBarClick}
            >
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
      )}

      {selectedSLoc && (
        <div style={{ marginTop: '2rem' }}>
          <h2>📋 SKU Detail for {selectedSLoc}</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                {Object.keys(filteredGoodData[0] || {}).map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredGoodData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((cell, j) => (
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
