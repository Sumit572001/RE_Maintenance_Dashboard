import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Clock, Timer, Calendar } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'
import { getQuarterMonths, MONTH_COLORS } from '../utils/quarterUtils'

const CustomProjectTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md max-w-xs">
        <p className="text-xs font-bold text-slate-900 mb-1 leading-snug">{data.fullProject}</p>
        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-600">
            Average TAT: <span className="text-sm font-extrabold">{data.avgTat}</span> Days
          </p>
          <p className="text-slate-500 font-medium">
            Based on <span className="font-bold text-slate-800">{data.count.toLocaleString()}</span> requests (Completion Date - Raised On)
          </p>
        </div>
      </div>
    )
  }
  return null
}

const CustomDistributionTooltip = ({ active, payload, totalRecords, isSplit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const pct = totalRecords > 0 ? ((data.count / totalRecords) * 100).toFixed(1) : 0
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md min-w-[170px]">
        <p className="text-xs font-bold text-slate-900 mb-1">TAT Range: {data.range}</p>
        <p className="text-sm font-semibold text-amber-600">
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

const CustomProjectBarLabel = (props) => {
  const { x, y, width, height, value } = props
  if (value === undefined || value === null) return null
  return (
    <text
      x={x + width + 8}
      y={y + height / 2 + 4}
      fill="#1e293b"
      fontSize={12}
      fontWeight={700}
      textAnchor="start"
    >
      {value} days
    </text>
  )
}

const CustomTopLabel = (props) => {
  const { x, y, width, value } = props
  if (!value) return null
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#1e293b"
      fontSize={12}
      fontWeight={700}
      textAnchor="middle"
    >
      {value.toLocaleString()}
    </text>
  )
}

const CustomYAxisTick = ({ x, y, payload }) => {
  const text = payload.value || ''
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={4}
        fill="#334155"
        fontSize={13}
        fontWeight={500}
        textAnchor="end"
      >
        {text}
      </text>
    </g>
  )
}

export function TatBarChart({
  data = [],
  onBarClick,
  onBucketClick,
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL',
  selectedQuarter = 'ALL',
  quarterMode = 'calendar',
  onSelectQuarter
}) {
  const [activeTab, setActiveTab] = useState('distribution') // 'distribution' | 'project'
  const [viewMode, setViewMode] = useState('split') // 'split' | 'total'

  const quarterInfo = useMemo(() => {
    return getQuarterMonths(selectedQuarter, quarterMode)
  }, [selectedQuarter, quarterMode])

  const isSplitActive = selectedQuarter !== 'ALL' && viewMode === 'split' && activeTab === 'distribution'

  // By Project Chart Data
  const projectChartData = useMemo(() => {
    if (!data.length) return []

    const projectStats = {}
    data.forEach((item) => {
      const proj = item.projectName || 'Unknown Project'
      const tat = item.tatDays || item.ageInDays || 0

      if (!projectStats[proj]) {
        projectStats[proj] = { totalTat: 0, count: 0 }
      }
      projectStats[proj].totalTat += tat
      projectStats[proj].count += 1
    })

    return Object.entries(projectStats)
      .map(([proj, stats]) => {
        const cleanedProj = proj.replace(/\s+/g, ' ').trim()
        const avgTat = Math.round((stats.totalTat / stats.count) * 10) / 10
        return {
          fullProject: proj,
          shortName: cleanedProj,
          avgTat,
          count: stats.count
        }
      })
      .sort((a, b) => b.avgTat - a.avgTat)
      .slice(0, 10)
  }, [data])

  // TAT Distribution Data
  const distributionData = useMemo(() => {
    if (!data.length) return []

    const [m1Idx, m2Idx, m3Idx] = quarterInfo.monthIndices

    const bucketRanges = [
      { range: '0-2 Days', min: 0, max: 2 },
      { range: '3-5 Days', min: 3, max: 5 },
      { range: '6-7 Days', min: 6, max: 7 },
      { range: '8-15 Days', min: 8, max: 15 },
      { range: '16-30 Days', min: 16, max: 30 },
      { range: '>30 Days', min: 31, max: null }
    ]

    const buckets = {}
    bucketRanges.forEach((b) => {
      buckets[b.range] = { count: 0, m1: 0, m2: 0, m3: 0, min: b.min, max: b.max }
    })

    data.forEach((item) => {
      const tat = item.tatDays || item.ageInDays || 0
      let targetRange = '>30 Days'
      if (tat <= 2) targetRange = '0-2 Days'
      else if (tat <= 5) targetRange = '3-5 Days'
      else if (tat <= 7) targetRange = '6-7 Days'
      else if (tat <= 15) targetRange = '8-15 Days'
      else if (tat <= 30) targetRange = '16-30 Days'

      buckets[targetRange].count++

      if (item.raisedOnDate instanceof Date && !isNaN(item.raisedOnDate.getTime())) {
        const m = item.raisedOnDate.getMonth()
        if (m === m1Idx) buckets[targetRange].m1++
        else if (m === m2Idx) buckets[targetRange].m2++
        else if (m === m3Idx) buckets[targetRange].m3++
      }
    })

    return bucketRanges.map((b) => ({
      range: b.range,
      count: buckets[b.range].count,
      m1: buckets[b.range].m1,
      m2: buckets[b.range].m2,
      m3: buckets[b.range].m3,
      m1Name: quarterInfo.names[0],
      m2Name: quarterInfo.names[1],
      m3Name: quarterInfo.names[2],
      min: b.min,
      max: b.max
    }))
  }, [data, quarterInfo])

  // Calculate overall average TAT
  const overallAvgTat = useMemo(() => {
    if (!data.length) return 0
    const totalTat = data.reduce((acc, curr) => acc + (curr.tatDays || curr.ageInDays || 0), 0)
    return Math.round((totalTat / data.length) * 10) / 10
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[450px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {activeTab === 'project' ? 'Turnaround Time (TAT) by Project' : 'TAT Distribution'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Calculated as: <span className="font-semibold text-slate-700">Completion Date - Raised On</span>
            </p>
          </div>
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
          {selectedQuarter !== 'ALL' && activeTab === 'distribution' && (
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
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
            <button
              onClick={() => setActiveTab('project')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'project'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              By Project
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'distribution'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              TAT Distribution
            </button>
          </div>

          <div className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-full font-extrabold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Avg TAT: {overallAvgTat} Days</span>
          </div>
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

      {activeTab === 'project' ? (
        projectChartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            No TAT data available
          </div>
        ) : (
          <div className="flex-1 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={projectChartData}
                margin={{ top: 5, right: 65, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="tatBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={310}
                  tick={<CustomYAxisTick />}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomProjectTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
                <Bar
                  dataKey="avgTat"
                  fill="url(#tatBarGrad)"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                  animationDuration={800}
                  label={<CustomProjectBarLabel />}
                >
                  {projectChartData.map((entry, index) => (
                    <Cell
                      key={`cell-tat-${index}`}
                      onClick={() => onBarClick && onBarClick(entry.fullProject)}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      ) : distributionData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No distribution data available
        </div>
      ) : (
        <div className="flex-1 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 25, right: 20, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="distroBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomDistributionTooltip totalRecords={data.length} isSplit={isSplitActive} />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
              
              {isSplitActive ? (
                <>
                  <Bar
                    dataKey="m1"
                    name={quarterInfo.names[0]}
                    fill={MONTH_COLORS.m1}
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                    animationDuration={700}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={`cell-dist-m1-${index}`}
                        fill={MONTH_COLORS.m1}
                        onClick={() =>
                          onBucketClick
                            ? onBucketClick(entry.range, entry.min, entry.max)
                            : onBarClick && onBarClick(entry.range)
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
                    barSize={14}
                    animationDuration={700}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={`cell-dist-m2-${index}`}
                        fill={MONTH_COLORS.m2}
                        onClick={() =>
                          onBucketClick
                            ? onBucketClick(entry.range, entry.min, entry.max)
                            : onBarClick && onBarClick(entry.range)
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
                    barSize={14}
                    animationDuration={700}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={`cell-dist-m3-${index}`}
                        fill={MONTH_COLORS.m3}
                        onClick={() =>
                          onBucketClick
                            ? onBucketClick(entry.range, entry.min, entry.max)
                            : onBarClick && onBarClick(entry.range)
                        }
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                </>
              ) : (
                <Bar
                  dataKey="count"
                  fill="url(#distroBarGrad)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                  label={<CustomTopLabel />}
                >
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={`cell-dist-${index}`}
                      onClick={() =>
                        onBucketClick
                          ? onBucketClick(entry.range, entry.min, entry.max)
                          : onBarClick && onBarClick(entry.range)
                      }
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
