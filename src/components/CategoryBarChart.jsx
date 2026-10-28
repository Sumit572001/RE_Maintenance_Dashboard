import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts'
import { Layers, MapPin, ListFilter, Calendar } from 'lucide-react'
import { getQuarterMonths, MONTH_COLORS } from '../utils/quarterUtils'

const PALETTE = [
  '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#eab308',
  '#06b6d4', '#ec4899', '#f43f5e', '#8b5cf6', '#10b981',
  '#6366f1', '#14b8a6', '#f59e0b', '#84cc16', '#d946ef',
  '#0284c7', '#fb923c', '#4ade80'
]

const CustomCategoryTooltip = ({ active, payload, totalRecords, isSplit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const pct = totalRecords > 0 ? ((data.count / totalRecords) * 100).toFixed(1) : 0
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md min-w-[170px]">
        <p className="text-xs font-bold text-slate-900 mb-1">{data.category}</p>
        <p className="text-sm font-semibold text-emerald-600">
          {data.count.toLocaleString()} <span className="text-xs font-normal text-slate-500">requests</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">{pct}% of total filtered</p>
        {isSplit && (
          <div className="space-y-1 pt-2 mt-1.5 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: MONTH_COLORS.m1 }} />
                {data.m1Name}:
              </span>
              <span className="font-bold text-slate-900">{(data.m1 || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: MONTH_COLORS.m2 }} />
                {data.m2Name}:
              </span>
              <span className="font-bold text-slate-900">{(data.m2 || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: MONTH_COLORS.m3 }} />
                {data.m3Name}:
              </span>
              <span className="font-bold text-slate-900">{(data.m3 || 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

const CustomZoneTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tp-${index}`} className="flex items-center justify-between gap-4 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-slate-900">{entry.value.toLocaleString()} requests</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function CategoryBarChart({
  data = [],
  onBarClick,
  onRequestTypeBarClick,
  onZoneBarClick,
  selectedQuarter = 'ALL',
  quarterMode = 'calendar',
  onSelectQuarter
}) {
  const [activeTab, setActiveTab] = useState('category') // 'category' | 'requestType' | 'zone'
  const [showAll, setShowAll] = useState(false)
  const [viewMode, setViewMode] = useState('split') // 'split' | 'total'

  const quarterInfo = useMemo(() => {
    return getQuarterMonths(selectedQuarter, quarterMode)
  }, [selectedQuarter, quarterMode])

  const isSplitActive = selectedQuarter !== 'ALL' && viewMode === 'split' && activeTab !== 'zone'

  // Category (Request Group) breakdown calculation
  const { categoryData, totalRecords } = useMemo(() => {
    if (!data.length) return { categoryData: [], totalRecords: 0 }

    const [m1Idx, m2Idx, m3Idx] = quarterInfo.monthIndices
    const categoryCounts = {}

    data.forEach((item) => {
      const grp = item.requestGroup || 'Unspecified'
      if (!categoryCounts[grp]) {
        categoryCounts[grp] = { count: 0, m1: 0, m2: 0, m3: 0 }
      }
      categoryCounts[grp].count++

      if (item.raisedOnDate instanceof Date && !isNaN(item.raisedOnDate.getTime())) {
        const m = item.raisedOnDate.getMonth()
        if (m === m1Idx) categoryCounts[grp].m1++
        else if (m === m2Idx) categoryCounts[grp].m2++
        else if (m === m3Idx) categoryCounts[grp].m3++
      }
    })

    const result = Object.entries(categoryCounts)
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        m1: stats.m1,
        m2: stats.m2,
        m3: stats.m3,
        m1Name: quarterInfo.names[0],
        m2Name: quarterInfo.names[1],
        m3Name: quarterInfo.names[2]
      }))
      .sort((a, b) => b.count - a.count)

    return { categoryData: result, totalRecords: data.length }
  }, [data, quarterInfo])

  const displayCategoryData = useMemo(() => {
    return showAll ? categoryData : categoryData.slice(0, 10)
  }, [categoryData, showAll])

  // Request Type breakdown calculation
  const { requestTypeData } = useMemo(() => {
    if (!data.length) return { requestTypeData: [] }

    const [m1Idx, m2Idx, m3Idx] = quarterInfo.monthIndices
    const typeCounts = {}

    data.forEach((item) => {
      const type = item.requestType || 'Unspecified'
      if (!typeCounts[type]) {
        typeCounts[type] = { count: 0, m1: 0, m2: 0, m3: 0 }
      }
      typeCounts[type].count++

      if (item.raisedOnDate instanceof Date && !isNaN(item.raisedOnDate.getTime())) {
        const m = item.raisedOnDate.getMonth()
        if (m === m1Idx) typeCounts[type].m1++
        else if (m === m2Idx) typeCounts[type].m2++
        else if (m === m3Idx) typeCounts[type].m3++
      }
    })

    const result = Object.entries(typeCounts)
      .map(([type, stats]) => ({
        category: type,
        count: stats.count,
        m1: stats.m1,
        m2: stats.m2,
        m3: stats.m3,
        m1Name: quarterInfo.names[0],
        m2Name: quarterInfo.names[1],
        m3Name: quarterInfo.names[2]
      }))
      .sort((a, b) => b.count - a.count)

    return { requestTypeData: result }
  }, [data, quarterInfo])

  const displayRequestTypeData = useMemo(() => {
    return showAll ? requestTypeData : requestTypeData.slice(0, 10)
  }, [requestTypeData, showAll])

  // Zone comparison calculation (Top 8 categories)
  const zoneCompareData = useMemo(() => {
    if (!data.length) return []

    const categoryTotals = {}
    data.forEach((item) => {
      const grp = item.requestGroup || 'Unspecified'
      categoryTotals[grp] = (categoryTotals[grp] || 0) + 1
    })

    const top8Categories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([grp]) => grp)

    return top8Categories.map((grp) => {
      let nagarRoadCount = 0
      let countyCount = 0

      data.forEach((item) => {
        if (item.requestGroup === grp) {
          const zone = (item.zoneName || '').toLowerCase()
          if (zone.includes('nagar')) nagarRoadCount++
          else if (zone.includes('county')) countyCount++
        }
      })

      return {
        category: grp,
        'Nagar Road': nagarRoadCount,
        'County': countyCount
      }
    })
  }, [data])

  const titleText = useMemo(() => {
    if (activeTab === 'category') {
      return showAll ? 'Request Group Breakdown (All)' : 'Top 10 Request Groups'
    } else if (activeTab === 'requestType') {
      return showAll ? 'Request Type Breakdown (All)' : 'Top 10 Request Types'
    } else {
      return 'Zone Comparison (Top 8 Categories)'
    }
  }, [activeTab, showAll])

  const currentTotalCount = activeTab === 'category' ? categoryData.length : activeTab === 'requestType' ? requestTypeData.length : 0
  const canShowAll = (activeTab === 'category' || activeTab === 'requestType') && currentTotalCount > 10

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col transition-all duration-300 ${
        showAll ? 'h-[650px]' : 'h-[450px]'
      }`}
    >
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {activeTab === 'category' && <Layers className="w-4 h-4 text-emerald-600" />}
          {activeTab === 'requestType' && <ListFilter className="w-4 h-4 text-purple-600" />}
          {activeTab === 'zone' && <MapPin className="w-4 h-4 text-cyan-600" />}
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {titleText}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quarter Pills: Full Year vs Q1, Q2, Q3, Q4 */}
          {onSelectQuarter && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              {['ALL', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                const isCurrent = selectedQuarter === q
                return (
                  <button
                    key={q}
                    onClick={() => onSelectQuarter(q === selectedQuarter && q !== 'ALL' ? 'ALL' : q)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {q === 'ALL' ? 'Year' : q}
                  </button>
                )
              })}
            </div>
          )}

          {/* Toggle between 3 Months Split and Consolidated Total (when a Quarter is active) */}
          {selectedQuarter !== 'ALL' && activeTab !== 'zone' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show 3 months individually side-by-side"
              >
                3 Months
              </button>
              <button
                onClick={() => setViewMode('total')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'total' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show single consolidated quarter total"
              >
                Total
              </button>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center gap-0.5">
            <button
              onClick={() => setActiveTab('category')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'category'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Request Groups
            </button>
            <button
              onClick={() => setActiveTab('requestType')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'requestType'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Request Types
            </button>
            <button
              onClick={() => setActiveTab('zone')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'zone'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Zone Compare
            </button>
          </div>

          {/* Show All Toggle */}
          {canShowAll && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              {showAll ? 'Show Top 10' : `Show All (${currentTotalCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Quarter Month Legend when 3-Month Split is active */}
      {isSplitActive && (
        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 mb-1 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500">
            {selectedQuarter} ({quarterInfo.names.join(' - ')}) — 3-Month Breakdown:
          </span>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5" style={{ color: MONTH_COLORS.m1 }}>
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: MONTH_COLORS.m1 }} />
              {quarterInfo.names[0]}
            </span>
            <span className="flex items-center gap-1.5" style={{ color: MONTH_COLORS.m2 }}>
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: MONTH_COLORS.m2 }} />
              {quarterInfo.names[1]}
            </span>
            <span className="flex items-center gap-1.5" style={{ color: MONTH_COLORS.m3 }}>
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: MONTH_COLORS.m3 }} />
              {quarterInfo.names[2]}
            </span>
          </div>
        </div>
      )}

      {/* Chart View */}
      {activeTab === 'category' ? (
        categoryData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            No category data available
          </div>
        ) : (
          <div className="flex-1 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayCategoryData} margin={{ top: 10, right: 10, left: -10, bottom: showAll ? 115 : 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="category"
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={10}
                        dx={-5}
                        textAnchor="end"
                        fill="#334155"
                        fontSize={showAll ? 11 : 12.5}
                        fontWeight={500}
                        transform="rotate(-40)"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomCategoryTooltip totalRecords={totalRecords} isSplit={isSplitActive} />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
                
                {isSplitActive ? (
                  <>
                    <Bar
                      dataKey="m1"
                      name={quarterInfo.names[0]}
                      fill={MONTH_COLORS.m1}
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={700}
                    >
                      {displayCategoryData.map((entry, index) => (
                        <Cell
                          key={`cell-cat-m1-${index}`}
                          fill={MONTH_COLORS.m1}
                          onClick={() => onBarClick && onBarClick(entry.category)}
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="m2"
                      name={quarterInfo.names[1]}
                      fill={MONTH_COLORS.m2}
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={700}
                    >
                      {displayCategoryData.map((entry, index) => (
                        <Cell
                          key={`cell-cat-m2-${index}`}
                          fill={MONTH_COLORS.m2}
                          onClick={() => onBarClick && onBarClick(entry.category)}
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="m3"
                      name={quarterInfo.names[2]}
                      fill={MONTH_COLORS.m3}
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={700}
                    >
                      {displayCategoryData.map((entry, index) => (
                        <Cell
                          key={`cell-cat-m3-${index}`}
                          fill={MONTH_COLORS.m3}
                          onClick={() => onBarClick && onBarClick(entry.category)}
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </>
                ) : (
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                    {displayCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-cat-${index}`}
                        fill={PALETTE[index % PALETTE.length]}
                        onClick={() => onBarClick && onBarClick(entry.category)}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      ) : activeTab === 'requestType' ? (
        requestTypeData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            No request type data available
          </div>
        ) : (
          <div className="flex-1 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayRequestTypeData} margin={{ top: 10, right: 10, left: -10, bottom: showAll ? 115 : 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="category"
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={10}
                        dx={-5}
                        textAnchor="end"
                        fill="#334155"
                        fontSize={showAll ? 11 : 12.5}
                        fontWeight={500}
                        transform="rotate(-40)"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomCategoryTooltip totalRecords={totalRecords} isSplit={isSplitActive} />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
                
                {isSplitActive ? (
                  <>
                    <Bar
                      dataKey="m1"
                      name={quarterInfo.names[0]}
                      fill={MONTH_COLORS.m1}
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={700}
                    >
                      {displayRequestTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-type-m1-${index}`}
                          fill={MONTH_COLORS.m1}
                          onClick={() =>
                            onRequestTypeBarClick
                              ? onRequestTypeBarClick(entry.category)
                              : onBarClick && onBarClick(entry.category, 'requestType')
                          }
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="m2"
                      name={quarterInfo.names[1]}
                      fill={MONTH_COLORS.m2}
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={700}
                    >
                      {displayRequestTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-type-m2-${index}`}
                          fill={MONTH_COLORS.m2}
                          onClick={() =>
                            onRequestTypeBarClick
                              ? onRequestTypeBarClick(entry.category)
                              : onBarClick && onBarClick(entry.category, 'requestType')
                          }
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="m3"
                      name={quarterInfo.names[2]}
                      fill={MONTH_COLORS.m3}
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={700}
                    >
                      {displayRequestTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-type-m3-${index}`}
                          fill={MONTH_COLORS.m3}
                          onClick={() =>
                            onRequestTypeBarClick
                              ? onRequestTypeBarClick(entry.category)
                              : onBarClick && onBarClick(entry.category, 'requestType')
                          }
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </>
                ) : (
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                    {displayRequestTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-type-${index}`}
                        fill={PALETTE[(index + 3) % PALETTE.length]}
                        onClick={() =>
                          onRequestTypeBarClick
                            ? onRequestTypeBarClick(entry.category)
                            : onBarClick && onBarClick(entry.category, 'requestType')
                        }
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      ) : zoneCompareData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No zone comparison data available
        </div>
      ) : (
        <div className="flex-1 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneCompareData} margin={{ top: 10, right: 10, left: -10, bottom: 105 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="category"
                interval={0}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={10}
                      dx={-5}
                      textAnchor="end"
                      fill="#334155"
                      fontSize={12.5}
                      fontWeight={500}
                      transform="rotate(-30)"
                    >
                      {payload.value}
                    </text>
                  </g>
                )}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomZoneTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar
                dataKey="Nagar Road"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                onClick={(entry) => (onZoneBarClick ? onZoneBarClick(entry.category, 'Nagar Road') : onBarClick && onBarClick(entry.category))}
                className="cursor-pointer hover:opacity-85"
              />
              <Bar
                dataKey="County"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                onClick={(entry) => (onZoneBarClick ? onZoneBarClick(entry.category, 'County') : onBarClick && onBarClick(entry.category))}
                className="cursor-pointer hover:opacity-85"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
