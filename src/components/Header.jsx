import React, { useState, useEffect } from 'react'
import { Building2, Upload, FileText, Database, CalendarRange, ChevronDown } from 'lucide-react'

export function Header({
  fileName,
  totalRecords,
  onUploadNew,
  onOpenAIAssistant,
  filters,
  setFilters,
  filterOptions,
  showQuarterCard,
  onToggleQuarterCard,
  onShowQuarterCard
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  // If a specific quarter is selected, ensure side quarters are visible
  useEffect(() => {
    if (filters?.quarter && filters.quarter !== 'ALL') {
      setIsExpanded(true)
    }
  }, [filters?.quarter])

  const handleAllQuartersClick = () => {
    if (!isExpanded) {
      // First click: expand side quarters and show Quarter Comparison card
      setIsExpanded(true)
      if (onShowQuarterCard) {
        onShowQuarterCard(true)
      }
    } else {
      // If already expanded:
      if (filters?.quarter !== 'ALL') {
        // If a quarter was active, reset to ALL quarters
        setFilters?.((prev) => ({ ...prev, quarter: 'ALL' }))
      } else {
        // If already on ALL, toggle collapse
        setIsExpanded(false)
        if (onShowQuarterCard) {
          onShowQuarterCard(false)
        }
      }
    }
  }

  const handleQuarterClick = (qId) => {
    if (!setFilters) return
    setFilters((prev) => ({
      ...prev,
      quarter: prev.quarter === qId ? 'ALL' : qId
    }))
    // When clicking any quarter, also ensure the comparison card is open
    if (onShowQuarterCard) {
      onShowQuarterCard(true)
    }
  }

  const handleYearChange = (yr) => {
    if (!setFilters) return
    setFilters((prev) => ({
      ...prev,
      year: yr
    }))
  }

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-slate-200 shadow-sm bg-white/95 backdrop-blur-md">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/10">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">RE Maintenance</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-500">Analytics Dashboard</p>
          </div>
        </div>

        {/* Center: "All Quarters" button which reveals side quarters Q1, Q2, Q3, Q4 & Year when clicked */}
        {filters && filterOptions && (
          <div className="flex items-center gap-2 flex-nowrap justify-center bg-slate-50/90 border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs">
            {/* The single "All Quarters" button */}
            <button
              type="button"
              onClick={handleAllQuartersClick}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                filters.quarter === 'ALL'
                  ? isExpanded
                    ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500/30'
                    : 'bg-white text-slate-800 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
              title={isExpanded ? 'All Quarters (Click to collapse or show full year)' : 'Click to show Quarters Q1, Q2, Q3, Q4'}
            >
              <CalendarRange
                className={`w-3.5 h-3.5 ${
                  filters.quarter === 'ALL' && isExpanded ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span className="tracking-wide">All Quarters</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  filters.quarter === 'ALL' && isExpanded
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {filterOptions.quarterCounts?.ALL ?? totalRecords ?? 0}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                } ${filters.quarter === 'ALL' && isExpanded ? 'text-white' : 'text-slate-400'}`}
              />
            </button>

            {/* Side Quarters (Q1, Q2, Q3, Q4 & Year) - Smooth GPU-accelerated CSS slide-and-fade */}
            <div
              className={`flex items-center gap-2 flex-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isExpanded
                  ? 'max-w-[750px] opacity-100 translate-x-0'
                  : 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
              }`}
            >
              {/* Side Quarter Pills (Q1, Q2, Q3, Q4) */}
              <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs shrink-0 whitespace-nowrap">
                {(filterOptions.quarterOptions || []).map((q) => {
                  const isSelected = filters.quarter === q.id
                  const count = q.count || 0
                  const hasData = count > 0

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleQuarterClick(q.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : hasData
                          ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={`${q.label} (${count} requests)`}
                    >
                      <span>{q.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : hasData
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Year Filter inside Quarter bar */}
              {filterOptions.years && filterOptions.years.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs whitespace-nowrap">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Year:</span>
                  <select
                    value={filters.year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Years</option>
                    {filterOptions.years.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Info & Actions */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {/* File Name Tag */}
          {fileName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="max-w-[140px] sm:max-w-[180px] truncate font-medium">{fileName}</span>
            </div>
          )}

          {/* Record Count Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
            <Database className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{totalRecords.toLocaleString()} Total Records</span>
          </div>

          {/* Upload New File Button */}
          <button
            onClick={onUploadNew}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all duration-200 rounded-lg shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-60" />
    </header>
  )
}
