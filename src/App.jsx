import React, { useState } from 'react'
import { UploadPage } from './pages/UploadPage'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  const [excelData, setExcelData] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleDataLoaded = (data, name) => {
    setExcelData(data)
    setFileName(name)
  }

  const handleUploadNew = () => {
    setExcelData(null)
    setFileName('')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {!excelData ? (
        <UploadPage onDataLoaded={handleDataLoaded} />
      ) : (
        <Dashboard
          rawData={excelData}
          fileName={fileName}
          onUploadNew={handleUploadNew}
        />
      )}
    </div>
  )
}
