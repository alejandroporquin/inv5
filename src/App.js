
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './index.css';

function App() {
  const [fileData, setFileData] = useState({
    alignment: [],
    goodData: [],
    batchMovements: [],
    batchAdjustments: [],
    expiredBatches: []
  });
  const [selectedSLoc, setSelectedSLoc] = useState(null);
  const [activeTab, setActiveTab] = useState("alignment");
  const [selectedAdjustmentSLoc, setSelectedAdjustmentSLoc] = useState("All");
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [selectedExpiredSLoc, setSelectedExpiredSLoc] = useState("All");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      const alignmentSheet = wb.Sheets["Alignment Summary"];
      const goodSheet = wb.Sheets["Good Data"];
      const batchMoveSheet = wb.Sheets["Batch Movements"];
      const batchAdjustSheet = wb.Sheets["Batch Adjustments"];
      const expiredSheet = wb.Sheets["Expired Batches"];

      setFileData({
        alignment: XLSX.utils.sheet_to_json(alignmentSheet),
        goodData: XLSX.utils.sheet_to_json(goodSheet),
        batchMovements: XLSX.utils.sheet_to_json(batchMoveSheet),
        batchAdjustments: XLSX.utils.sheet_to_json(batchAdjustSheet),
        expiredBatches: XLSX.utils.sheet_to_json(expiredSheet)
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

    const filteredGoodData = selectedSLoc
      ? fileData.goodData.filter(row => row["SLoc"] === selectedSLoc)
      : [];

    return (
      <>
        <h2>📊 Alignment Summary</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {alignmentData.map((item, idx) => (
            <div
              key={idx}
              style={{ border: '1px solid #ccc', padding: '1rem', cursor: 'pointer' }}
              onClick={() => setSelectedSLoc(item.SLoc)}
            >
              <strong>{item.SLoc}</strong><br />
              Total: {item.Total}%<br />
              Batch: {item.Batch}%
            </div>
          ))}
        </div>
        {selectedSLoc && (
          <>
            <h3>Details for {selectedSLoc}</h3>
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
          </>
        )}
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
    const filtered = selectedAdjustmentSLoc === "All"
      ? fileData.batchAdjustments
      : fileData.batchAdjustments.filter(r => r["SLoc"] === selectedAdjustmentSLoc);

    return (
      <>
        <h2>🔧 Batch Adjustments</h2>
        <select onChange={e => setSelectedAdjustmentSLoc(e.target.value)} value={selectedAdjustmentSLoc}>
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
      const slocMatch = selectedExpiredSLoc === "All" || row["SLoc"] === selectedExpiredSLoc;
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
        <select onChange={e => setSelectedExpiredSLoc(e.target.value)} value={selectedExpiredSLoc}>
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

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: 220, background: '#f2f2f2', padding: '1rem', minHeight: '100vh' }}>
        <h2>📁 Sections</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><button onClick={() => setActiveTab("alignment")}>Alignment Summary</button></li>
          <li><button onClick={() => setActiveTab("batchMove")}>Batch Movements</button></li>
          <li><button onClick={() => setActiveTab("adjustments")}>Batch Adjustments</button></li>
          <li><button onClick={() => setActiveTab("expired")}>Expired Batches</button></li>
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
