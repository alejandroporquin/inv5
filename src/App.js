
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
    shortRisk: [],
    transactionCheck: []
  });
  const [activeTab, setActiveTab] = useState("alignment");

  const [selectedSLocs, setSelectedSLocs] = useState({
    alignment: null,
    adjustments: "All",
    expired: "All",
    shortRisk: "All",
    transaction: "All"
  });
  const [selectedBucket, setSelectedBucket] = useState("All");

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

  const renderTransactionCheck = () => {
    const slocs = Array.from(new Set(fileData.transactionCheck.map(row => row["SLoc"]))).sort();
    const filtered = selectedSLocs.transaction === "All"
      ? fileData.transactionCheck
      : fileData.transactionCheck.filter(row => row["SLoc"] === selectedSLocs.transaction);

    return (
      <>
        <h2>🧾 Transaction Check</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Filter by SLoc: </strong></label>
          <select
            onChange={e =>
              setSelectedSLocs(prev => ({ ...prev, transaction: e.target.value }))
            }
            value={selectedSLocs.transaction}
          >
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
            {activeTab === "alignment" && <div>👷 Alignment view here</div>}
            {activeTab === "batchMove" && <div>🚛 Batch movement view here</div>}
            {activeTab === "adjustments" && <div>🔧 Adjustments view here</div>}
            {activeTab === "expired" && <div>⏳ Expired batches view here</div>}
            {activeTab === "shortRisk" && <div>🚨 Short Risk view here</div>}
            {activeTab === "transaction" && renderTransactionCheck()}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
