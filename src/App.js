
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './index.css';

function App() {
  const [fileData, setFileData] = useState({
    alignment: [],
    goodData: [],
    batchMovements: [],
    batchAdjustments: [],
    expiredBatches: [],
    shortRisk: []
  });
  const [selectedSLoc, setSelectedSLoc] = useState(null);
  const [activeTab, setActiveTab] = useState("alignment");
  const [selectedAdjustmentSLoc, setSelectedAdjustmentSLoc] = useState("All");
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [selectedExpiredSLoc, setSelectedExpiredSLoc] = useState("All");
  const [selectedShortSLoc, setSelectedShortSLoc] = useState("All");

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
      const shortSheet = wb.Sheets["Short Risk SKUs"];

      setFileData({
        alignment: XLSX.utils.sheet_to_json(alignmentSheet),
        goodData: XLSX.utils.sheet_to_json(goodSheet),
        batchMovements: XLSX.utils.sheet_to_json(batchMoveSheet),
        batchAdjustments: XLSX.utils.sheet_to_json(batchAdjustSheet),
        expiredBatches: XLSX.utils.sheet_to_json(expiredSheet),
        shortRisk: XLSX.utils.sheet_to_json(shortSheet)
      });
    };
    reader.readAsBinaryString(file);
  };

  const renderShortRisk = () => {
    const slocs = Array.from(new Set(fileData.shortRisk.map(row => row["SLoc"]))).sort();
    const filtered = selectedShortSLoc === "All"
      ? fileData.shortRisk
      : fileData.shortRisk.filter(row => row["SLoc"] === selectedShortSLoc);

    return (
      <>
        <h2>🚨 Short Risk SKUs</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Filter by SLoc: </strong></label>
          <select onChange={e => setSelectedShortSLoc(e.target.value)} value={selectedShortSLoc}>
            <option value="All">All</option>
            {slocs.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>
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
              <tr key={i} style={{
                backgroundColor:
                  row["Total Confirmed Qty"] === 0 || row["Short Risk Priority"] === 1
                    ? "#ffd6d6"
                    : "transparent"
              }}>
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
          </>
        )}
      </div>
    </div>
  );
}

// Reuse existing rendering logic from earlier versions
function renderAlignment() { return <div>👷 Alignment view here</div>; }
function renderBatchMovements() { return <div>🚛 Batch movement view here</div>; }
function renderBatchAdjustments() { return <div>🔧 Adjustments view here</div>; }
function renderExpiredBatches() { return <div>⏳ Expired batches view here</div>; }

export default App;
