
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [selectedSLoc, setSelectedSLoc] = useState("All");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      const expiredSheet = wb.Sheets["Expired Batches"];
      const expiredJson = XLSX.utils.sheet_to_json(expiredSheet);
      setExpiredBatches(expiredJson);
    };
    reader.readAsBinaryString(file);
  };

  const buckets = Array.from(new Set(expiredBatches.map(row => row["Bucket"]))).sort();
  const slocs = Array.from(new Set(expiredBatches.map(row => row["SLoc"]))).sort();

  const filteredData = expiredBatches.filter(row => {
    const matchBucket = selectedBucket === "All" || row["Bucket"] === selectedBucket;
    const matchSLoc = selectedSLoc === "All" || row["SLoc"] === selectedSLoc;
    return matchBucket && matchSLoc;
  });

  return (
    <div>
      <h1>⏳ Expired Batches Viewer</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {expiredBatches.length > 0 && (
        <>
          <div style={{ marginTop: '2rem' }}>
            <h2>📁 Filter by Expiry Bucket</h2>
            <button onClick={() => setSelectedBucket("All")}>All</button>
            {buckets.map((bucket, idx) => (
              <button key={idx} onClick={() => setSelectedBucket(bucket)}>{bucket}</button>
            ))}
          </div>

          <div style={{ margin: '1rem 0' }}>
            <label><strong>Filter by SLoc: </strong></label>
            <select onChange={e => setSelectedSLoc(e.target.value)} value={selectedSLoc}>
              <option value="All">All</option>
              {slocs.map((sloc, idx) => (
                <option key={idx} value={sloc}>{sloc}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h2>📋 Expired Batch Data</h2>
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  {Object.keys(filteredData[0] || {}).map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
