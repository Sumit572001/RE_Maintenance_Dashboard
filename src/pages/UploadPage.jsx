import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react'
import { parseExcel } from '../hooks/useExcelData'

export function UploadPage({ onDataLoaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [loadingText, setLoadingText] = useState('')
  const fileInputRef = useRef(null)

  const handleFileProcess = async (file) => {
    if (!file) return

    const name = file.name.toLowerCase()
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      setErrorMessage('Please upload a valid Excel file (.xlsx or .xls).')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setLoadingText(`Reading ${file.name}...`)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          setLoadingText('Parsing maintenance records from Excel sheet...')
          const parsedData = await parseExcel(e.target.result)
          if (!parsedData || parsedData.length === 0) {
            setErrorMessage('No records could be extracted from the Excel sheet.')
            setIsLoading(false)
            return
          }
          onDataLoaded(parsedData, file.name)
        } catch (err) {
          console.error(err)
          setErrorMessage('Failed to parse Excel headers. Please check file formatting.')
          setIsLoading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to read file.')
      setIsLoading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.target.files ? e.target.files[0] : e.dataTransfer.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-xl text-center z-10"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
          RE Maintenance Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-8">
          Upload your Excel maintenance report to analyze requests, SLAs, and project metrics.
        </p>

        {/* Drag & Drop Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative overflow-hidden bg-white border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all duration-300 cursor-pointer group shadow-xl ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
              : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={(e) => e.target.files && handleFileProcess(e.target.files[0])}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-slate-800">{loadingText}</h3>
              <p className="text-xs text-slate-500 mt-1">Processing in-browser with SheetJS...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <UploadCloud className="w-10 h-10 text-blue-600 group-hover:animate-bounce" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Click to browse or drop your Excel file
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Supports <span className="text-slate-800 font-mono font-semibold">.xlsx</span> and{' '}
                <span className="text-slate-800 font-mono font-semibold">.xls</span>
              </p>

              <button
                type="button"
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Select File From Computer
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
