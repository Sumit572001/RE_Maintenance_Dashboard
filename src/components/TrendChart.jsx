import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-blue-600">
          {payload[0].value.toLocaleString()} <span className="text-xs font-normal text-slate-700">requests</span>
        </p>
      </div>
    )
  }
  return null
}

export function TrendChart({
  data = [],
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL'
}) {
  const chartData = useMemo(() => {
    if (!data.length) return []

    // Group dates by Week / Date
    const dateCounts = {}
    data.forEach((item) => {
      if (!item.raisedOnDate) return
      
      const d = item.raisedOnDate
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1
    })

    const sortedEntries = Object.entries(dateCounts).sort((a, b) => a[0].localeCompare(b[0]))

    if (sortedEntries.length > 25) {
      const weeklyCounts = []
      let currentWeekLabel = ''
      let currentSum = 0
      let countInWeek = 0

      sortedEntries.forEach(([dateKey, count], idx) => {
        if (countInWeek === 0) {
          const d = new Date(dateKey)
          currentWeekLabel = `Wk of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        }
        currentSum += count
        countInWeek++

        if (countInWeek === 7 || idx === sortedEntries.length - 1) {
          weeklyCounts.push({
            dateLabel: currentWeekLabel,
            requests: currentSum
          })
          countInWeek = 0
          currentSum = 0
        }
      })

      return weeklyCounts
    }

    return sortedEntries.map(([dateKey, count]) => {
      const d = new Date(dateKey)
      return {
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests: count
      }
    })
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[360px] col-span-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Requests Trend Over Time</h3>
        </div>
        <div className="flex items-center gap-2">
          <ChartRequestTypeSelect
            selectedType={selectedType}
            onTypeChange={onTypeChange}
            requestTypes={requestTypes}
            selectedGroup={selectedGroup}
          />
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Timeline Trend</span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No date trend data available
        </div>
      ) : (
        <div className="flex-1 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#trendGradient)"
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
