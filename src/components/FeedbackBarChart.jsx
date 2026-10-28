import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ThumbsUp, Smile, Calendar } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'
import { getQuarterMonths, MONTH_COLORS } from '../utils/quarterUtils'

const CustomTooltip = ({ active, payload, isSplit, quarterInfo }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md max-w-xs">
        <p className="text-xs font-bold text-slate-900 mb-1 leading-snug">{data.category}</p>
        <div className="space-y-1 text-xs">
          <p className="font-extrabold" style={{ color: data.color }}>
            {data.count.toLocaleString()} <span className="font-semibold text-slate-600">requests</span> ({data.percentage}%)
          </p>
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
          <p className="text-[11px] text-slate-500 font-medium">Click to inspect these feedback records</p>
        </div>
      </div>
    )
  }
  return null
}

const CustomBarLabel = (props) => {
  const { x, y, width, height, value } = props
  if (value === undefined || value === null || value === 0) return null
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

export function FeedbackBarChart({
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
  const [viewMode, setViewMode] = useState('split') // 'split' | 'total'

  const quarterInfo = useMemo(() => {
    return getQuarterMonths(selectedQuarter, quarterMode)
  }, [selectedQuarter, quarterMode])

  const isSplitActive = selectedQuarter !== 'ALL' && viewMode === 'split'

  const chartData = useMemo(() => {
    if (!data.length) return []

    const [m1Idx, m2Idx, m3Idx] = quarterInfo.monthIndices

    const categories = {
      'Excellent': { count: 0, m1: 0, m2: 0, m3: 0, color: '#059669', fill: 'url(#excellentGrad)' },
      'Good': { count: 0, m1: 0, m2: 0, m3: 0, color: '#10b981', fill: 'url(#goodGrad)' },
      'Satisfactory': { count: 0, m1: 0, m2: 0, m3: 0, color: '#0284c7', fill: 'url(#satisfactoryGrad)' },
      'Average': { count: 0, m1: 0, m2: 0, m3: 0, color: '#f59e0b', fill: 'url(#avgGrad)' },
      'Below Average': { count: 0, m1: 0, m2: 0, m3: 0, color: '#f43f5e', fill: 'url(#belowAvgGrad)' },
      'No Feedback': { count: 0, m1: 0, m2: 0, m3: 0, color: '#94a3b8', fill: 'url(#noGrad)' }
    }

    data.forEach((item) => {
      const fbStr = String(item.feedbacks || item.feedbackComments || '').toLowerCase().trim()
      let cat = 'Good'
      
      if (!fbStr || fbStr === '-' || fbStr === 'n/a' || fbStr === 'none' || fbStr === 'null' || fbStr === '(blanks)') {
        cat = 'No Feedback'
      } else if (
        fbStr.includes('below') ||
        fbStr.includes('poor') ||
        fbStr.includes('bad') ||
        fbStr.includes('unsatisfied') ||
        fbStr.includes('dissatisfied')
      ) {
        cat = 'Below Average'
      } else if (fbStr.includes('excellent')) {
        cat = 'Excellent'
      } else if (fbStr.includes('satisf')) {
        cat = 'Satisfactory'
      } else if (fbStr.includes('good')) {
        cat = 'Good'
      } else if (fbStr.includes('average') || fbStr.includes('fair') || fbStr.includes('ok')) {
        cat = 'Average'
      } else {
        if (fbStr === '5') cat = 'Excellent'
        else if (fbStr === '4') cat = 'Good'
        else if (fbStr === '3') cat = 'Average'
        else if (fbStr === '1' || fbStr === '2') cat = 'Below Average'
        else cat = 'Good'
      }

      categories[cat].count++

      if (item.raisedOnDate instanceof Date && !isNaN(item.raisedOnDate.getTime())) {
        const m = item.raisedOnDate.getMonth()
        if (m === m1Idx) categories[cat].m1++
        else if (m === m2Idx) categories[cat].m2++
        else if (m === m3Idx) categories[cat].m3++
      }
    })

    const total = data.length || 1

    return Object.entries(categories).map(([category, stats]) => ({
      category,
      count: stats.count,
      m1: stats.m1,
      m2: stats.m2,
      m3: stats.m3,
      m1Name: quarterInfo.names[0],
      m2Name: quarterInfo.names[1],
      m3Name: quarterInfo.names[2],
      percentage: Math.round((stats.count / total) * 100),
      color: stats.color,
      fill: stats.fill
    }))
  }, [data, quarterInfo])

  // Calculate Positive Satisfaction Rate (Excellent + Good + Satisfactory)
  const satisfactionRate = useMemo(() => {
    if (!data.length) return 0
    const positiveCount =
      (chartData.find((d) => d.category === 'Excellent')?.count || 0) +
      (chartData.find((d) => d.category === 'Good')?.count || 0) +
      (chartData.find((d) => d.category === 'Satisfactory')?.count || 0)
    const totalWithFb = data.length - (chartData.find((d) => d.category === 'No Feedback')?.count || 0)
    if (totalWithFb <= 0) return 100
    return Math.round((positiveCount / totalWithFb) * 100)
  }, [data, chartData])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[460px]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Customer Feedback Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Source: <span className="font-semibold text-slate-700">Excel Feedbacks Column</span>
            </p>
          </div>
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

          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-full font-extrabold flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-emerald-600" />
            <span>{satisfactionRate}% Satisfied</span>
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

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No feedback data available
        </div>
      ) : (
        <div className="flex-1 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: isSplitActive ? 25 : 65, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="excellentGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="goodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="satisfactoryGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="belowAvgGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
                <linearGradient id="noGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                width={130}
                tick={<CustomYAxisTick />}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip isSplit={isSplitActive} quarterInfo={quarterInfo} />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
              
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
                        key={`cell-fb-m1-${index}`}
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
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                    animationDuration={700}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-fb-m2-${index}`}
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
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                    animationDuration={700}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-fb-m3-${index}`}
                        fill={MONTH_COLORS.m3}
                        onClick={() => onBarClick && onBarClick(entry.category)}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                </>
              ) : (
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                  animationDuration={800}
                  label={<CustomBarLabel />}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-fb-${index}`}
                      fill={entry.fill}
                      onClick={() => onBarClick && onBarClick(entry.category)}
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
