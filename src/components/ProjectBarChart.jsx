import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { Building2, Calendar } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'
import { getQuarterMonths, MONTH_COLORS } from '../utils/quarterUtils'

const CustomTooltip = ({ active, payload, isSplit, quarterInfo }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md max-w-xs">
        <p className="text-xs font-bold text-slate-900 mb-1 leading-snug">{data.fullProject}</p>
        <p className="text-xs font-bold text-slate-700 mb-1">
          Total: <span className="text-blue-600 font-extrabold">{data.count.toLocaleString()}</span> requests
        </p>
        {isSplit && (
          <div className="space-y-1 pt-2 mt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: MONTH_COLORS.m1 }} />
                {data.m1Name}:
              </span>
              <span className="font-bold text-slate-900">{data.m1.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: MONTH_COLORS.m2 }} />
                {data.m2Name}:
              </span>
              <span className="font-bold text-slate-900">{data.m2.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: MONTH_COLORS.m3 }} />
                {data.m3Name}:
              </span>
              <span className="font-bold text-slate-900">{data.m3.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

const CustomBarLabel = (props) => {
  const { x, y, width, height, value } = props
  if (!value) return null
  return (
    <text
      x={x + width + 8}
      y={y + height / 2 + 4}
      fill="#1e293b"
      fontSize={12}
      fontWeight={700}
      textAnchor="start"
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

export function ProjectBarChart({
  data = [],
  onBarClick,
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL',
  selectedQuarter = 'ALL',
  quarterMode = 'calendar',
  onSelectQuarter
}) {
  const [showAll, setShowAll] = useState(false)
  const [viewMode, setViewMode] = useState('split') // 'split' | 'total'

  const quarterInfo = useMemo(() => {
    return getQuarterMonths(selectedQuarter, quarterMode)
  }, [selectedQuarter, quarterMode])

  const isSplitActive = selectedQuarter !== 'ALL' && viewMode === 'split'

  const allProjectsData = useMemo(() => {
    if (!data.length) return []

    const [m1Idx, m2Idx, m3Idx] = quarterInfo.monthIndices
    const projectStats = {}

    data.forEach((item) => {
      const proj = item.projectName || 'Unknown Project'
      if (!projectStats[proj]) {
        projectStats[proj] = { count: 0, m1: 0, m2: 0, m3: 0 }
      }
      projectStats[proj].count++

      if (item.raisedOnDate instanceof Date && !isNaN(item.raisedOnDate.getTime())) {
        const m = item.raisedOnDate.getMonth()
        if (m === m1Idx) projectStats[proj].m1++
        else if (m === m2Idx) projectStats[proj].m2++
        else if (m === m3Idx) projectStats[proj].m3++
      }
    })

    return Object.entries(projectStats)
      .map(([proj, stats]) => {
        const cleanedProj = proj.replace(/\s+/g, ' ').trim()
        return {
          fullProject: proj,
          shortName: cleanedProj,
          count: stats.count,
          m1: stats.m1,
          m2: stats.m2,
          m3: stats.m3,
          m1Name: quarterInfo.names[0],
          m2Name: quarterInfo.names[1],
          m3Name: quarterInfo.names[2]
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [data, quarterInfo])

  const chartData = useMemo(() => {
    return showAll ? allProjectsData : allProjectsData.slice(0, 10)
  }, [allProjectsData, showAll])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col transition-all duration-300 ${
        showAll ? 'h-[650px]' : 'h-[460px]'
      }`}
    >
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {showAll ? 'All Projects By Client Request' : 'Top 10 Projects By Client Request'}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
          {selectedQuarter !== 'ALL' && (
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

          {allProjectsData.length > 10 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              {showAll ? 'Show Top 10' : `Show All (${allProjectsData.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Quarter Month Legend when 3-Month Split is active */}
      {isSplitActive && (
        <div className="flex items-center justify-between text-xs px-2 py-1.5 mb-1 bg-slate-50 border border-slate-100 rounded-xl">
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

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No project data available
        </div>
      ) : (
        <div className="flex-1 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: isSplitActive ? 20 : 50, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="projectBarGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="shortName"
                width={280}
                tick={<CustomYAxisTick />}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip isSplit={isSplitActive} quarterInfo={quarterInfo} />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
              />

              {isSplitActive ? (
                <>
                  <Bar
                    dataKey="m1"
                    name={quarterInfo.names[0]}
                    fill={MONTH_COLORS.m1}
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                    animationDuration={700}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-proj-m1-${index}`}
                        fill={MONTH_COLORS.m1}
                        onClick={() => onBarClick && onBarClick(entry.fullProject)}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="m2"
                    name={quarterInfo.names[1]}
                    fill={MONTH_COLORS.m2}
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                    animationDuration={700}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-proj-m2-${index}`}
                        fill={MONTH_COLORS.m2}
                        onClick={() => onBarClick && onBarClick(entry.fullProject)}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="m3"
                    name={quarterInfo.names[2]}
                    fill={MONTH_COLORS.m3}
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                    animationDuration={700}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-proj-m3-${index}`}
                        fill={MONTH_COLORS.m3}
                        onClick={() => onBarClick && onBarClick(entry.fullProject)}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                </>
              ) : (
                <Bar
                  dataKey="count"
                  fill="url(#projectBarGrad)"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                  animationDuration={1000}
                  label={<CustomBarLabel />}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      onClick={() => onBarClick && onBarClick(entry.fullProject)}
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
