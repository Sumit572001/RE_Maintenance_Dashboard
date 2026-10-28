import React from 'react'
import { motion } from 'framer-motion'
import { CalendarRange, CheckCircle2, Clock, XCircle, ArrowUpRight, BarChart3, RotateCcw, X } from 'lucide-react'

const QUARTER_THEMES = {
  Q1: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20',
    accentText: 'text-blue-600',
    barColor: 'bg-blue-500',
    gradient: 'from-blue-50/60 to-transparent'
  },
  Q2: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20',
    accentText: 'text-emerald-600',
    barColor: 'bg-emerald-500',
    gradient: 'from-emerald-50/60 to-transparent'
  },
  Q3: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20',
    accentText: 'text-amber-600',
    barColor: 'bg-amber-500',
    gradient: 'from-amber-50/60 to-transparent'
  },
  Q4: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20',
    accentText: 'text-purple-600',
    barColor: 'bg-purple-500',
    gradient: 'from-purple-50/60 to-transparent'
  }
}

export function QuarterComparisonCard({
  quarterStats = [],
  selectedQuarter = 'ALL',
  onSelectQuarter,
  selectedYear = 'ALL',
  onYearChange,
  years = [],
  quarterMode = 'calendar',
  onToggleQuarterMode,
  totalRecords = 0,
  onClose
}) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Quarter-wise Performance Comparison
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                3 Months per Quarter
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare request volumes, closure rates, and aging across 4 quarters — click any quarter card to filter
            </p>
          </div>
        </div>

        {/* Right Controls: Year selector & Clear Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Year Filter (if years exist) */}
          {years.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Years</option>
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Switch (Calendar vs Fiscal) */}
          {onToggleQuarterMode && (
            <button
              onClick={onToggleQuarterMode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Toggle between Calendar Year (Jan-Dec) and Indian Financial Year (Apr-Mar)"
            >
              <span>{quarterMode === 'fiscal' ? 'Fiscal (Apr-Mar)' : 'Calendar (Jan-Dec)'}</span>
            </button>
          )}

          {/* Reset Filter Button */}
          {selectedQuarter !== 'ALL' && (
            <button
              onClick={() => onSelectQuarter('ALL')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>View Full Year</span>
            </button>
          )}

          {/* Hide / Close Card Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              title="Hide Quarter Comparison"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              <span>Hide</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Quarter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quarterStats.map((item) => {
          const isSelected = selectedQuarter === item.id
          const theme = QUARTER_THEMES[item.id] || QUARTER_THEMES.Q1
          const pctShare = totalRecords > 0 ? ((item.total / totalRecords) * 100).toFixed(1) : 0
          const completedPct = item.total > 0 ? (item.completed / item.total) * 100 : 0
          const pendingPct = item.total > 0 ? (item.pending / item.total) * 100 : 0
          const hasData = item.total > 0

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectQuarter(item.id)}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${theme.activeBorder} shadow-md`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              } ${!hasData ? 'opacity-65 hover:opacity-90' : ''}`}
            >
              {/* Subtle background glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-40 pointer-events-none`}
              />

              {/* Card Top: Quarter Badge & Months */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border shadow-2xs ${theme.badge}`}
                  >
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{item.months}</span>
                </div>

                {isSelected ? (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Filter
                  </span>
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                )}
              </div>

              {/* Card Body: Request Count & Workload % */}
              <div className="relative z-10 mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {item.total.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">requests</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {hasData ? `${pctShare}% of annual workload` : 'No requests recorded'}
                </p>
              </div>

              {/* Mini Status Breakdown Bar */}
              <div className="relative z-10 mb-3 space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${completedPct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Completed: ${item.completed}`}
                  />
                  <div
                    style={{ width: `${pendingPct}%` }}
                    className="bg-amber-500 h-full transition-all duration-500"
                    title={`Pending: ${item.pending}`}
                  />
                  <div
                    style={{ width: `${100 - completedPct - pendingPct}%` }}
                    className="bg-rose-500 h-full transition-all duration-500"
                    title={`Cancel/Reject: ${item.cancel + item.reject}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span className="text-emerald-700 font-semibold">{item.completed} Resolved</span>
                  <span className="text-amber-700 font-semibold">{item.pending} Pending</span>
                </div>
              </div>

              {/* Metric Stats Pills Row */}
              <div className="relative z-10 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Closure Rate</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {item.closure}%
                  </span>
                </div>
                <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Avg Age</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {item.avgAge} <span className="text-[10px] font-normal text-slate-500">days</span>
                  </span>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="relative z-10 mt-3 pt-2 text-center">
                <span
                  className={`text-[11px] font-bold transition-colors ${
                    isSelected ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isSelected
                    ? 'Showing this Quarter • Click to reset'
                    : hasData
                    ? `Click to filter to ${item.name}`
                    : 'No data in this quarter'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
