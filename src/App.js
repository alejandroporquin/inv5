
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './index.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [fileData, setFileData] = useState({
    alignment: [],
    goodData: [],
    batchMovements: [],
    batchAdjustments: [],
    expiredBatches: [],
    shortRisk: [],
    transactionCheck: []
  });
  const [selectedSLocs, setSelectedSLocs] = useState({
    alignment: null,
    adjustments: "All",
    expired: "All",
    shortRisk: "All",
    transaction: "All"
  });
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [activeTab, setActiveTab] = useState("alignment");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      setFileData({
        alignment: XLSX.utils.sheet_to_json(wb.Sheets["Alignment Summary"]),
        goodData: XLSX.utils.sheet_to_json(wb.Sheets["Good Data"]),
        batchMovements: XLSX.utils.sheet_to_json(wb.Sheets["Batch Movements"]),
        batchAdjustments: XLSX.utils.sheet_to_json(wb.Sheets["Batch Adjustments"]),
        expiredBatches: XLSX.utils.sheet_to_json(wb.Sheets["Expired Batches"]),
        shortRisk: XLSX.utils.sheet_to_json(wb.Sheets["Short Risk SKUs"]),
        transactionCheck: XLSX.utils.sheet_to_json(wb.Sheets["Transaction Check"])
      });
    };
    reader.readAsBinaryString(file);
  };

  const renderAlignment = () => {
    const alignmentData = fileData.alignment.map(row => ({
      SLoc: row["SLoc"],
      Total: row["Alignment %"] || 0,
      Batch: row["Batch Alignment %"] || 0
    }));

    const dataForChart = alignmentData.map(item => ({
      name: item.SLoc,
      totalAlignment: item.Total,
      batchAlignment: item.Batch
    }));

    return (
      <>
        <h2>📊 Alignment Summary</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataForChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalAlignment" fill="#8884d8" />
            <Bar dataKey="batchAlignment" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {alignmentData.map((item, idx) => (
            <div
              key={idx}
              style={{ border: '1px solid #ccc', padding: '1rem', cursor: 'pointer' }}
              onClick={() => setSelectedSLocs(prev => ({ ...prev, alignment: item.SLoc }))}
            >
              <strong>{item.SLoc}</strong><br />
              Total: {item.Total}%<br />
              Batch: {item.Batch}%
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderBatchMovements = () => (
    <>
      <h2>🚛 Batch Movements</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            {Object.keys(fileData.batchMovements[0] || {}).map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fileData.batchMovements.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  const renderBatchAdjustments = () => {
    const slocs = Array.from(new Set(fileData.batchAdjustments.map(row => row["SLoc"]))).sort();
    const filtered = selectedSLocs.adjustments === "All"
      ? fileData.batchAdjustments
      : fileData.batchAdjustments.filter(r => r["SLoc"] === selectedSLocs.adjustments);

    return (
      <>
        <h2>🔧 Batch Adjustments</h2>
        <select onChange={e => setSelectedSLocs(prev => ({ ...prev, adjustments: e.target.value }))} value={selectedSLocs.adjustments}>
          <option value="All">All</option>
          {slocs.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              {Object.keys(filtered[0] || {}).map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const renderExpiredBatches = () => {
    const buckets = Array.from(new Set(fileData.expiredBatches.map(row => row["Bucket"]))).sort();
    const slocs = Array.from(new Set(fileData.expiredBatches.map(row => row["SLoc"]))).sort();

    const filtered = fileData.expiredBatches.filter(row => {
      const bucketMatch = selectedBucket === "All" || row["Bucket"] === selectedBucket;
      const slocMatch = selectedSLocs.expired === "All" || row["SLoc"] === selectedSLocs.expired;
      return bucketMatch && slocMatch;
    });

    return (
      <>
        <h2>⏳ Expired Batches</h2>
        <div>
          {buckets.map((b, i) => (
            <button key={i} onClick={() => setSelectedBucket(b)}>{b}</button>
          ))}
          <button onClick={() => setSelectedBucket("All")}>All</button>
        </div>
        <select onChange={e => setSelectedSLocs(prev => ({ ...prev, expired: e.target.value }))} value={selectedSLocs.expired}>
          <option value="All">All</option>
          {slocs.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              {Object.keys(filtered[0] || {}).map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const renderShortRisk = () => {
    const slocs = Array.from(new Set(fileData.shortRisk.map(row => row["SLoc"]))).sort();
    const filtered = selectedSLocs.shortRisk === "All"
      ? fileData.shortRisk
      : fileData.shortRisk.filter(row => row["SLoc"] === selectedSLocs.shortRisk);

    return (
      <>
        <h2>🚨 Short Risk SKUs</h2>
        <select onChange={e => setSelectedSLocs(prev => ({ ...prev, shortRisk: e.target.value }))} value={selectedSLocs.shortRisk}>
          <option value="All">All</option>
          {slocs.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              {Object.keys(filtered[0] || {}).map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} style={{ backgroundColor: row["Total Confirmed Qty"] === 0 || row["Short Risk Priority"] === 1 ? "#ffd6d6" : "transparent" }}>
                {Object.values(row).map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const renderTransactionCheck = () => {
    const slocs = Array.from(new Set(fileData.transactionCheck.map(row => row["SLoc"]))).sort();
    const filtered = selectedSLocs.transaction === "All"
      ? fileData.transactionCheck
      : fileData.transactionCheck.filter(row => row["SLoc"] === selectedSLocs.transaction);

    return (
      <>
        <h2>🧾 Transaction Check</h2>
        <select onChange={e => setSelectedSLocs(prev => ({ ...prev, transaction: e.target.value }))} value={selectedSLocs.transaction}>
          <option value="All">All</option>
          {slocs.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              {Object.keys(filtered[0] || {}).map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} style={{ backgroundColor: row["SYS DIF"] !== 0 ? "#ffd6d6" : "transparent" }}>
                {Object.values(row).map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: 220, background: '#f2f2f2', padding: '1rem', minHeight: '100vh' }}>
        <h2>📁 Sections</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><button onClick={() => setActiveTab("alignment")}>Alignment Summary</button></li>
          <li><button onClick={() => setActiveTab("batchMove")}>Batch Movements</button></li>
          <li><button onClick={() => setActiveTab("adjustments")}>Batch Adjustments</button></li>
          <li><button onClick={() => setActiveTab("expired")}>Expired Batches</button></li>
          <li><button onClick={() => setActiveTab("shortRisk")}>Short Risk SKUs</button></li>
          <li><button onClick={() => setActiveTab("transaction")}>Transaction Check</button></li>
        </ul>
      </div>
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1>📦 Inventory Dashboard</h1>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <hr />
        {fileData.alignment.length > 0 && (
          <>
            {activeTab === "alignment" && renderAlignment()}
            {activeTab === "batchMove" && renderBatchMovements()}
            {activeTab === "adjustments" && renderBatchAdjustments()}
            {activeTab === "expired" && renderExpiredBatches()}
            {activeTab === "shortRisk" && renderShortRisk()}
            {activeTab === "transaction" && renderTransactionCheck()}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
