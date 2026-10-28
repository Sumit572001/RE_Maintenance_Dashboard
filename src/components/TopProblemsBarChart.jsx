import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Flame, Calendar, Trophy } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'

const RANK_STYLES = [
  { fill: '#f59e0b', stroke: '#d97706', badge: 'bg-amber-100 text-amber-800 border-amber-300', gradient: 'from-amber-500 to-yellow-400', label: '1st Most Frequent' },
  { fill: '#6366f1', stroke: '#4f46e5', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', gradient: 'from-indigo-500 to-blue-500', label: '2nd Most Frequent' },
  { fill: '#10b981', stroke: '#059669', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', gradient: 'from-emerald-500 to-teal-400', label: '3rd Most Frequent' },
  { fill: '#8b5cf6', stroke: '#7c3aed', badge: 'bg-purple-100 text-purple-800 border-purple-300', gradient: 'from-purple-500 to-violet-500', label: '4th Most Frequent' },
  { fill: '#f43f5e', stroke: '#e11d48', badge: 'bg-rose-100 text-rose-800 border-rose-300', gradient: 'from-rose-500 to-pink-500', label: '5th Most Frequent' }
]

const CustomTooltip = ({ active, payload, totalRecords }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const pct = totalRecords > 0 ? ((data.count / totalRecords) * 100).toFixed(1) : 0
    const rankStyle = RANK_STYLES[data.rank - 1] || RANK_STYLES[4]

    return (
      <div className="bg-white/95 border border-slate-200 p-4 rounded-2xl shadow-xl backdrop-blur-md max-w-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full border ${rankStyle.badge}`}>
            Rank #{data.rank}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">{rankStyle.label}</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{data.category}</h4>
        <div className="space-y-1 text-xs">
          <p className="font-extrabold text-slate-800 text-base">
            {data.count.toLocaleString()} <span className="text-xs font-semibold text-slate-500">total requests</span>
          </p>
          <p className="text-[11px] text-slate-500">{pct}% of overall filtered workload</p>
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
      fill="#334155"
      fontSize={12}
      fontWeight={700}
      textAnchor="start"
    >
      {value.toLocaleString()}
    </text>
  )
}

export function TopProblemsBarChart({
  data = [],
  onBarClick,
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL'
}) {
  const [selectedMonth, setSelectedMonth] = useState('ALL')

  // All 12 Calendar Months list
  const calendarMonths = useMemo(() => {
    const months = [
      { value: '0', label: 'January' },
      { value: '1', label: 'February' },
      { value: '2', label: 'March' },
      { value: '3', label: 'April' },
      { value: '4', label: 'May' },
      { value: '5', label: 'June' },
      { value: '6', label: 'July' },
      { value: '7', label: 'August' },
      { value: '8', label: 'September' },
      { value: '9', label: 'October' },
      { value: '10', label: 'November' },
      { value: '11', label: 'December' }
    ]

    // Calculate count per month in current filtered data
    const monthCounts = {}
    data.forEach((item) => {
      if (!item.raisedOnDate) return
      const mIndex = item.raisedOnDate.getMonth()
      monthCounts[mIndex] = (monthCounts[mIndex] || 0) + 1
    })

    return months.map((m) => {
      const count = monthCounts[parseInt(m.value, 10)] || 0
      return {
        ...m,
        count,
        displayLabel: count > 0 ? `${m.label} (${count})` : m.label
      }
    })
  }, [data])

  // Filter data by selected month if not ALL
  const monthFilteredData = useMemo(() => {
    if (selectedMonth === 'ALL') return data

    const targetMonth = parseInt(selectedMonth, 10)
    return data.filter((item) => {
      if (!item.raisedOnDate) return false
      return item.raisedOnDate.getMonth() === targetMonth
    })
  }, [data, selectedMonth])

  // Calculate Top 5 Request Group categories by count
  const { top5Data, totalRecords } = useMemo(() => {
    if (!monthFilteredData.length) return { top5Data: [], totalRecords: 0 }

    const categoryCounts = {}
    monthFilteredData.forEach((item) => {
      const grp = item.requestGroup || 'Unspecified'
      categoryCounts[grp] = (categoryCounts[grp] || 0) + 1
    })

    const sorted = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    const top5 = sorted.slice(0, 5).map((item, index) => ({
      ...item,
      rank: index + 1,
      shortName: item.category
    }))

    return { top5Data: top5, totalRecords: monthFilteredData.length }
  }, [monthFilteredData])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[420px] col-span-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
            <Flame className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Top 5 Maintenance Problems (Request Group)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-600" /> Ranked #1 to #5
              </span>
            </div>
            <p className="text-xs text-slate-500">6 Months aggregated view sorted by highest request volume</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Range Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All 6 Months</option>
              {calendarMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.displayLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Request Type Filter */}
          <ChartRequestTypeSelect
            selectedType={selectedType}
            onTypeChange={onTypeChange}
            requestTypes={requestTypes}
            selectedGroup={selectedGroup}
          />
        </div>
      </div>

      {/* Bar Chart Body */}
      {top5Data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No maintenance problem data available for selected filter
        </div>
      ) : (
        <div className="flex-1 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={top5Data}
              margin={{ top: 10, right: 45, left: 10, bottom: 5 }}
              barCategoryGap="18%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                tick={({ x, y, payload, index }) => {
                  const rank = index + 1
                  const style = RANK_STYLES[index] || RANK_STYLES[4]
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <circle cx="-14" cy="-3" r="10" fill={style.fill} opacity={0.15} />
                      <text
                        x="-14"
                        y="1"
                        fill={style.fill}
                        fontSize={10}
                        fontWeight={800}
                        textAnchor="middle"
                      >
                        #{rank}
                      </text>
                      <text
                        x="-30"
                        y="1"
                        fill="#334155"
                        fontSize={13}
                        fontWeight={500}
                        textAnchor="end"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
                width={240}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip totalRecords={totalRecords} />} />
              <Bar
                dataKey="count"
                radius={[0, 8, 8, 0]}
                animationDuration={900}
                animationEasing="ease-out"
                cursor="pointer"
              >
                {top5Data.map((entry, index) => {
                  const style = RANK_STYLES[index] || RANK_STYLES[4]
                  return (
                    <Cell
                      key={`top-bar-${index}`}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={1}
                      className="transition-all duration-200 hover:opacity-85 hover:brightness-110"
                      onClick={() => onBarClick && onBarClick(entry.category)}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 Summary Legend Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top 5 Summary:</span>
        <div className="flex items-center gap-3 flex-wrap">
          {top5Data.map((item, idx) => {
            const style = RANK_STYLES[idx] || RANK_STYLES[4]
            return (
              <button
                key={item.category}
                onClick={() => onBarClick && onBarClick(item.category)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${style.badge}`}
              >
                <span>#{item.rank}</span>
                <span className="truncate max-w-[110px]">{item.category}</span>
                <span className="font-extrabold">({item.count})</span>
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
