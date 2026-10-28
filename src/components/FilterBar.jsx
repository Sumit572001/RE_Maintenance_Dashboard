import React from 'react'
import { motion } from 'framer-motion'
import {
  Filter,
  RotateCcw,
  Calendar,
  CalendarRange,
  MapPin,
  Building,
  Activity,
  Layers,
  AlertTriangle,
  Tag,
  Clock
} from 'lucide-react'

export function FilterBar({ filters, setFilters, filterOptions, activeCount, onReset }) {
  const handleChange = (key, value) => {
    if (key === 'requestGroup') {
      setFilters((prev) => {
        const validTypes = filterOptions.typesByGroup?.[value] || []
        const isTypeValid = value === 'ALL' || validTypes.includes(prev.requestType)
        return {
          ...prev,
          requestGroup: value,
          requestType: isTypeValid ? prev.requestType : 'ALL'
        }
      })
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }))
    }
  }

  const toggleQuarterMode = () => {
    setFilters((prev) => ({
      ...prev,
      quarterMode: prev.quarterMode === 'calendar' ? 'fiscal' : 'calendar'
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-4"
    >
      {/* 1. Header Bar: Title, Active Count, Mode Toggle, Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Data Filters</h2>
          {activeCount > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full animate-pulse">
              {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quarter Mode Toggle */}
          <button
            type="button"
            onClick={toggleQuarterMode}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all cursor-pointer"
            title="Toggle between Calendar Year (Jan-Dec) and Indian Financial Year (Apr-Mar)"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Mode: {filters.quarterMode === 'fiscal' ? 'Fiscal FY (Apr-Mar)' : 'Calendar CY (Jan-Dec)'}</span>
          </button>

          {/* Reset Filters */}
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* 1. Zone Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-600" /> Zone
          </label>
          <select
            value={filters.zone}
            onChange={(e) => handleChange('zone', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="ALL">All Zones</option>
            {filterOptions.zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Project Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-indigo-600" /> Project
          </label>
          <select
            value={filters.project}
            onChange={(e) => handleChange('project', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors truncate"
          >
            <option value="ALL">All Projects</option>
            {filterOptions.projects.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-600" /> Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="ALL">All Status</option>
            {filterOptions.statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Request Group Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" /> Request Group
          </label>
          <select
            value={filters.requestGroup}
            onChange={(e) => handleChange('requestGroup', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="ALL">All Categories</option>
            {filterOptions.requestGroups.map((grp) => (
              <option key={grp} value={grp}>
                {grp}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Priority Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="ALL">All Priority</option>
            {filterOptions.priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Request Type Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-purple-600" /> Request Type
          </label>
          <select
            value={filters.requestType}
            onChange={(e) => handleChange('requestType', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors truncate"
          >
            <option value="ALL">All Types</option>
            {filterOptions.requestTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 7. Quarter Dropdown Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <CalendarRange className="w-3.5 h-3.5 text-blue-600" /> Quarter
          </label>
          <select
            value={filters.quarter}
            onChange={(e) => handleChange('quarter', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors truncate"
          >
            <option value="ALL">All Quarters</option>
            {(filterOptions.quarterOptions || []).map((q) => (
              <option key={q.id} value={q.id}>
                {q.label} {q.count > 0 ? `(${q.count})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 8. Date Range Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Raised Date Range
          </label>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-1.5 py-2 focus:outline-none focus:bg-white focus:border-blue-500"
              title="From Date"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-1.5 py-2 focus:outline-none focus:bg-white focus:border-blue-500"
              title="To Date"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

