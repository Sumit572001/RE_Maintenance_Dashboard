import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, ArrowUpDown, ArrowUp, ArrowDown, Database, ExternalLink } from 'lucide-react'
import { getQuarterMonths } from '../utils/quarterUtils'

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

function getMonthBadgeStyle(monthName, quarter, mode = 'calendar') {
  if (!monthName || monthName === '-') return 'bg-slate-100 text-slate-700 border-slate-200'
  const qInfo = getQuarterMonths(quarter, mode)
  const idx = qInfo?.names ? qInfo.names.indexOf(monthName) : -1
  if (idx === 0) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (idx === 1) return 'bg-amber-50 text-amber-700 border-amber-200'
  if (idx === 2) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-blue-50 text-blue-700 border-blue-200'
}

export function DataTable({
  data = [],
  searchQuery,
  setSearchQuery,
  onRowClick,
  selectedQuarter = 'ALL',
  quarterMode = 'calendar'
}) {
  const isQuarterActive = Boolean(selectedQuarter && selectedQuarter !== 'ALL')
  // Sorting state
  const [sortField, setSortField] = useState('raisedOnDate')
  const [sortDirection, setSortDirection] = useState('desc')

  // Handle column header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sorted data memoized
  const sortedData = useMemo(() => {
    if (!data.length) return []

    return [...data].sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]

      if (valA === undefined || valA === null) valA = ''
      if (valB === undefined || valB === null) valB = ''

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortField, sortDirection])

  // Export to CSV function
  const exportToCSV = () => {
    if (!sortedData.length) return

    const headers = [
      'Request Number', 'Raised By', 'Zone', 'Project Name', 'Building',
      'Unit', 'Request Type', 'Status', 'Priority',
      'Age in Day(s)', 'Quarter', ...(isQuarterActive ? ['Month'] : []), 'Raised On', 'Description'
    ]

    const rows = sortedData.map(item => [
      `"${item.requestNumber}"`,
      `"${item.raisedBy}"`,
      `"${item.zoneName}"`,
      `"${item.projectName}"`,
      `"${item.buildingName}"`,
      `"${item.unit}"`,
      `"${item.requestType}"`,
      `"${item.status}"`,
      `"${item.priority}"`,
      item.ageInDays,
      `"${item.quarterLabel || item.quarterCalendar || '-'}"`,
      ...(isQuarterActive ? [`"${item.monthShort || '-'}"`] : []),
      `"${item.raisedOn}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `RE_Maintenance_Filtered_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col my-6"
    >
      {/* Top Bar: Search, CSV Export, Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search request #, user, zone, project, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>
          <span className="text-xs text-slate-600 font-bold whitespace-nowrap bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
            Showing all {sortedData.length.toLocaleString()} records
          </span>
        </div>

        <button
          onClick={exportToCSV}
          disabled={!sortedData.length}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Container - Single Scrollable View for All Rows */}
      <div className="overflow-x-auto overflow-y-auto max-h-[650px] rounded-xl border border-slate-200 bg-white relative">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="sticky top-0 bg-slate-100 z-20 shadow-xs">
            <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <th onClick={() => handleSort('requestNumber')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[110px] min-w-[105px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Req #</span>
                  {renderSortIndicator('requestNumber')}
                </div>
              </th>
              <th onClick={() => handleSort('raisedBy')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[105px] min-w-[95px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Raised By</span>
                  {renderSortIndicator('raisedBy')}
                </div>
              </th>
              <th onClick={() => handleSort('zoneName')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[80px] min-w-[75px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Zone</span>
                  {renderSortIndicator('zoneName')}
                </div>
              </th>
              <th onClick={() => handleSort('projectName')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[125px] min-w-[115px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Project</span>
                  {renderSortIndicator('projectName')}
                </div>
              </th>
              <th onClick={() => handleSort('buildingName')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[95px] min-w-[85px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Bldg / Unit</span>
                  {renderSortIndicator('buildingName')}
                </div>
              </th>
              <th onClick={() => handleSort('requestType')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[105px] min-w-[95px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Type</span>
                  {renderSortIndicator('requestType')}
                </div>
              </th>
              <th onClick={() => handleSort('status')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-1.5 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[75px] min-w-[70px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th onClick={() => handleSort('priority')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-1.5 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[70px] min-w-[65px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Priority</span>
                  {renderSortIndicator('priority')}
                </div>
              </th>
              <th onClick={() => handleSort('ageInDays')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-1.5 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[65px] min-w-[60px]" title="Age in Days">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Age (d)</span>
                  {renderSortIndicator('ageInDays')}
                </div>
              </th>
              <th onClick={() => handleSort('quarterCalendar')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-1.5 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[60px] min-w-[55px]">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Quarter</span>
                  {renderSortIndicator('quarterCalendar')}
                </div>
              </th>
              {isQuarterActive && (
                <th onClick={() => handleSort('monthIndex')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-1.5 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[65px] min-w-[60px]">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Month</span>
                    {renderSortIndicator('monthIndex')}
                  </div>
                </th>
              )}
              <th onClick={() => handleSort('raisedOnDate')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2 text-center cursor-pointer group hover:text-slate-900 border-b border-slate-200 w-[120px] min-w-[110px]">
                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                  <span>Raised On</span>
                  {renderSortIndicator('raisedOnDate')}
                </div>
              </th>
              <th onClick={() => handleSort('description')} className="sticky top-0 bg-slate-100 z-20 py-2.5 px-2.5 text-left cursor-pointer group hover:text-slate-900 border-b border-slate-200 min-w-[160px]">
                <div className="flex items-center justify-start gap-1">
                  <span>Description</span>
                  {renderSortIndicator('description')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={isQuarterActive ? 13 : 12} className="py-12 text-center text-slate-400">
                  <Database className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No records match your active filters or search criteria.
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-2 px-2 text-center font-mono font-semibold text-[11px] text-blue-600 group-hover:text-blue-700 whitespace-nowrap align-middle">
                    {row.requestNumber}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-900 font-medium text-[11px] truncate max-w-[105px] align-middle" title={row.raisedBy}>
                    {row.raisedBy || '-'}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-800 font-medium text-[11px] truncate max-w-[80px] align-middle" title={row.zoneName}>
                    {row.zoneName || '-'}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-900 font-semibold text-[11px] truncate max-w-[125px] align-middle" title={row.projectName}>
                    {row.projectName || '-'}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-700 font-medium text-[11px] truncate max-w-[95px] align-middle" title={row.buildingName ? `${row.buildingName} ${row.unit ? `(${row.unit})` : ''}` : '-'}>
                    {row.buildingName ? `${row.buildingName} ${row.unit ? `(${row.unit})` : ''}` : '-'}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-800 font-medium text-[11px] truncate max-w-[105px] align-middle" title={row.requestType}>
                    {row.requestType || '-'}
                  </td>
                  <td className="py-2 px-1.5 text-center align-middle whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full border font-semibold inline-block ${STATUS_BADGES[row.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2 px-1.5 text-center align-middle whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full border font-medium inline-block ${PRIORITY_BADGES[row.priority] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-2 px-1.5 text-center font-mono font-bold text-slate-900 text-xs align-middle">
                    {row.ageInDays}
                  </td>
                  <td className="py-2 px-1.5 text-center align-middle whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {row.quarterCalendar || '-'}
                    </span>
                  </td>
                  {isQuarterActive && (
                    <td className="py-2 px-1.5 text-center align-middle whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border inline-block ${getMonthBadgeStyle(row.monthShort, selectedQuarter, quarterMode)}`}>
                        {row.monthShort || '-'}
                      </span>
                    </td>
                  )}
                  <td className="py-2 px-2 text-center text-slate-700 text-[10.5px] font-medium whitespace-nowrap align-middle">
                    {row.raisedOn || '-'}
                  </td>
                  <td className="py-2 px-2.5 text-left text-slate-800 align-middle">
                    <div className="line-clamp-2 text-slate-800 font-normal text-[11px] leading-snug" title={row.description}>
                      {row.description || '-'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
