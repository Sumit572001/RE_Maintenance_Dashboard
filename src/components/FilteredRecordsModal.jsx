import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Download, Database, ExternalLink, Filter, Calendar } from 'lucide-react'
import { getQuarterMonths, MONTH_NAMES_SHORT } from '../utils/quarterUtils'

const STATUS_BADGES = {
  Pending: 'bg-orange-50 text-orange-700 border-orange-200',
  Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-purple-50 text-purple-700 border-purple-200',
  Reassigned: 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200'
}

const PRIORITY_BADGES = {
  High: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
  Low: 'bg-slate-100 text-slate-600 border-slate-200'
}

function getRecordMonthName(item) {
  if (item.monthShort) return item.monthShort
  if (item.raisedOnDate instanceof Date && !isNaN(item.raisedOnDate.getTime())) {
    return MONTH_NAMES_SHORT[item.raisedOnDate.getMonth()]
  }
  if (typeof item.raisedOn === 'string' && item.raisedOn.trim()) {
    const d = new Date(item.raisedOn)
    if (!isNaN(d.getTime())) {
      return MONTH_NAMES_SHORT[d.getMonth()]
    }
    const parts = item.raisedOn.split(/[-/]/)
    if (parts.length >= 3) {
      const m = parseInt(parts[1], 10) - 1
      if (m >= 0 && m < 12) return MONTH_NAMES_SHORT[m]
    }
  }
  return '-'
}

function getMonthBadgeStyle(monthName, quarter, mode = 'calendar') {
  if (!monthName || monthName === '-') return 'bg-slate-100 text-slate-700 border-slate-200'
  const qInfo = getQuarterMonths(quarter, mode)
  const idx = qInfo?.names ? qInfo.names.indexOf(monthName) : -1
  if (idx === 0) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (idx === 1) return 'bg-amber-50 text-amber-700 border-amber-200'
  if (idx === 2) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-blue-50 text-blue-700 border-blue-200'
}

export function FilteredRecordsModal({
  isOpen,
  title,
  records = [],
  onClose,
  onRecordClick,
  selectedQuarter = 'ALL',
  quarterMode = 'calendar'
}) {
  if (!isOpen) return null

  const isQuarterActive = Boolean(selectedQuarter && selectedQuarter !== 'ALL')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('ALL')

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMonth('ALL')
      setSearchQuery('')
    }
  }, [isOpen])

  // Get active quarter month names (e.g. ['Jan', 'Feb', 'Mar'] or ['Jul', 'Aug', 'Sep'])
  const quarterInfo = useMemo(() => {
    if (!isQuarterActive) return null
    return getQuarterMonths(selectedQuarter, quarterMode)
  }, [isQuarterActive, selectedQuarter, quarterMode])

  // Count records for each month in the active quarter
  const monthCounts = useMemo(() => {
    if (!isQuarterActive || !quarterInfo) return {}
    const counts = { ALL: records.length }
    quarterInfo.names.forEach((m) => {
      counts[m] = 0
    })
    records.forEach((r) => {
      const m = getRecordMonthName(r)
      if (counts[m] !== undefined) {
        counts[m]++
      }
    })
    return counts
  }, [records, isQuarterActive, quarterInfo])

  // Filter records by month tab and local search inside modal
  const filteredModalData = useMemo(() => {
    if (!records.length) return []

    let result = records

    // Filter by selected month tab if quarter mode is active
    if (isQuarterActive && selectedMonth !== 'ALL') {
      result = result.filter((item) => getRecordMonthName(item) === selectedMonth)
    }

    if (!searchQuery.trim()) return result

    const query = searchQuery.toLowerCase().trim()
    return result.filter((item) => {
      const m = getRecordMonthName(item).toLowerCase()
      return (
        (item.requestNumber || '').toLowerCase().includes(query) ||
        (item.raisedBy || '').toLowerCase().includes(query) ||
        (item.zoneName || '').toLowerCase().includes(query) ||
        (item.projectName || '').toLowerCase().includes(query) ||
        (item.requestGroup || '').toLowerCase().includes(query) ||
        (item.requestType || '').toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query) ||
        (item.status || '').toLowerCase().includes(query) ||
        m.includes(query) ||
        (item.monthFull || '').toLowerCase().includes(query)
      )
    })
  }, [records, selectedMonth, searchQuery, isQuarterActive])

  // Export to CSV (includes Month column if quarter mode is active)
  const exportToCSV = () => {
    if (!filteredModalData.length) return

    const headers = [
      'Request Number', 'Raised By', 'Zone', 'Project Name', 'Building',
      'Unit', 'Request Group', 'Request Type', 'Status', 'Priority',
      'Age in Day(s)', 'Quarter', ...(isQuarterActive ? ['Month'] : []), 'Raised On', 'Description'
    ]

    const rows = filteredModalData.map((item) => [
      `"${item.requestNumber}"`,
      `"${item.raisedBy}"`,
      `"${item.zoneName}"`,
      `"${item.projectName}"`,
      `"${item.buildingName}"`,
      `"${item.unit}"`,
      `"${item.requestGroup}"`,
      `"${item.requestType}"`,
      `"${item.status}"`,
      `"${item.priority}"`,
      item.ageInDays,
      `"${item.quarterLabel || item.quarterCalendar || '-'}"`,
      ...(isQuarterActive ? [`"${getRecordMonthName(item)}"`] : []),
      `"${item.raisedOn}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `RE_Maintenance_DrillDown_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Floating Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[96vw] 2xl:max-w-[1650px] max-h-[88vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">{title}</h2>
                  {isQuarterActive && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-600 text-white shadow-2xs">
                      {selectedQuarter} Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{filteredModalData.length.toLocaleString()}</span> matching requests
                  {isQuarterActive && selectedMonth !== 'ALL' && (
                    <span className="ml-1 text-blue-600 font-semibold">({selectedMonth} only)</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Close Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Search, Month Filter Pills & Export */}
          <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search inside these records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-3 py-2 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {/* Month Quick Filters when Quarter is Active */}
              {isQuarterActive && quarterInfo && (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto overflow-x-auto">
                  <span className="text-[11px] font-bold text-slate-500 px-1.5 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Month:
                  </span>
                  <button
                    onClick={() => setSelectedMonth('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedMonth === 'ALL'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    All ({records.length})
                  </button>
                  {quarterInfo.names.map((m, idx) => {
                    const count = monthCounts[m] || 0
                    const isCurrent = selectedMonth === m
                    const dotColors = ['#3b82f6', '#f59e0b', '#10b981']
                    return (
                      <button
                        key={m}
                        onClick={() => setSelectedMonth(selectedMonth === m ? 'ALL' : m)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isCurrent
                            ? 'bg-white text-slate-900 shadow-2xs ring-1 ring-slate-300'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: dotColors[idx] || '#64748b' }}
                        />
                        <span>{m}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">({count})</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              onClick={exportToCSV}
              disabled={!filteredModalData.length}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export These Records</span>
            </button>
          </div>

          {/* Scrollable Table Container */}
          <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col min-h-0">
            <div className="rounded-xl border border-slate-200 overflow-x-auto overflow-y-auto flex-1 bg-white relative">
              <table className="w-full text-left border-collapse table-auto">
                <thead className="sticky top-0 bg-slate-100 z-20 shadow-xs">
                  <tr className="text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <th className="sticky top-0 py-2.5 px-2 text-center bg-slate-100 z-20 border-b border-slate-200 w-[115px] min-w-[105px]">Req #</th>
                    <th className="sticky top-0 py-2.5 px-2 text-center bg-slate-100 z-20 border-b border-slate-200 w-[110px] min-w-[100px]">Raised By</th>
                    <th className="sticky top-0 py-2.5 px-2 text-center bg-slate-100 z-20 border-b border-slate-200 w-[85px] min-w-[75px]">Zone</th>
                    <th className="sticky top-0 py-2.5 px-2 text-center bg-slate-100 z-20 border-b border-slate-200 w-[130px] min-w-[120px]">Project</th>
                    <th className="sticky top-0 py-2.5 px-1.5 text-center bg-slate-100 z-20 border-b border-slate-200 w-[80px] min-w-[70px]">Status</th>
                    <th className="sticky top-0 py-2.5 px-1.5 text-center bg-slate-100 z-20 border-b border-slate-200 w-[75px] min-w-[65px]">Priority</th>
                    <th className="sticky top-0 py-2.5 px-1.5 text-center bg-slate-100 z-20 border-b border-slate-200 w-[65px] min-w-[55px]">Quarter</th>
                    {isQuarterActive && (
                      <th className="sticky top-0 py-2.5 px-1.5 text-center bg-slate-100 z-20 border-b border-slate-200 w-[75px] min-w-[70px]">Month</th>
                    )}
                    <th className="sticky top-0 py-2.5 px-1.5 text-center bg-slate-100 z-20 border-b border-slate-200 w-[90px] min-w-[80px]">TAT / Age (d)</th>
                    <th className="sticky top-0 py-2.5 px-2.5 text-left bg-slate-100 z-20 border-b border-slate-200 min-w-[160px]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredModalData.length === 0 ? (
                    <tr>
                      <td colSpan={isQuarterActive ? 10 : 9} className="py-12 text-center text-slate-400 text-sm">
                        <Database className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                        No requests match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredModalData.map((row) => {
                      const monthName = getRecordMonthName(row)
                      return (
                        <tr
                          key={row.id}
                          onClick={() => onRecordClick(row)}
                          className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-2 px-2 text-center font-mono font-semibold text-[11px] text-blue-600 group-hover:text-blue-700 whitespace-nowrap align-middle">
                            {row.requestNumber}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-900 font-medium text-[11px] truncate max-w-[110px] align-middle" title={row.raisedBy}>
                            {row.raisedBy || '-'}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-800 font-medium text-[11px] truncate max-w-[85px] align-middle" title={row.zoneName}>
                            {row.zoneName || '-'}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-900 font-semibold text-[11px] truncate max-w-[130px] align-middle" title={row.projectName}>
                            {row.projectName || '-'}
                          </td>
                          <td className="py-2 px-1.5 text-center whitespace-nowrap align-middle">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full border font-semibold inline-block ${STATUS_BADGES[row.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2 px-1.5 text-center whitespace-nowrap align-middle">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full border font-medium inline-block ${PRIORITY_BADGES[row.priority] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="py-2 px-1.5 text-center align-middle whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {row.quarterCalendar || '-'}
                            </span>
                          </td>
                          {isQuarterActive && (
                            <td className="py-2 px-1.5 text-center align-middle whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border inline-block ${getMonthBadgeStyle(monthName, selectedQuarter, quarterMode)}`}>
                                {monthName}
                              </span>
                            </td>
                          )}
                          <td className="py-2 px-1.5 text-center font-mono font-bold text-amber-700 text-xs align-middle whitespace-nowrap">
                            {row.tatDays ?? row.ageInDays}
                          </td>
                          <td className="py-2 px-2.5 text-left text-slate-800 align-middle">
                            <div className="line-clamp-2 text-slate-800 font-normal text-[11px] leading-snug" title={row.description}>
                              {row.description || '-'}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
