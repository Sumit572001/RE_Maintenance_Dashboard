import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { MapPin } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tp-${index}`} className="flex items-center justify-between gap-4 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
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

export function ZoneCompareChart({
  data = [],
  onBarClick,
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL'
}) {
  const chartData = useMemo(() => {
    if (!data.length) return []

    // Find top 8 request categories overall
    const categoryTotals = {}
    data.forEach((item) => {
      const grp = item.requestGroup || 'Unspecified'
      categoryTotals[grp] = (categoryTotals[grp] || 0) + 1
    })

    const top8Categories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([grp]) => grp)

    // Build zone comparison counts
    const result = top8Categories.map((grp) => {
      let nagarRoadCount = 0
      let countyCount = 0
      let otherZoneCount = 0

      data.forEach((item) => {
        if (item.requestGroup === grp) {
          const zone = (item.zoneName || '').toLowerCase()
          if (zone.includes('nagar')) nagarRoadCount++
          else if (zone.includes('county')) countyCount++
          else otherZoneCount++
        }
      })

      return {
        category: grp,
        'Nagar Road': nagarRoadCount,
        'County': countyCount
      }
    })

    return result
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[470px]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Zone Comparison (Top 8 Categories)</h3>
        </div>
        <div className="flex items-center gap-2">
          <ChartRequestTypeSelect
            selectedType={selectedType}
            onTypeChange={onTypeChange}
            requestTypes={requestTypes}
            selectedGroup={selectedGroup}
          />
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No zone comparison data available
        </div>
      ) : (
        <div className="flex-1 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 115 }}>
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar
                dataKey="Nagar Road"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                onClick={(entry) => onBarClick && onBarClick(entry.category, 'Nagar Road')}
                className="cursor-pointer hover:opacity-85"
              />
              <Bar
                dataKey="County"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                onClick={(entry) => onBarClick && onBarClick(entry.category, 'County')}
                className="cursor-pointer hover:opacity-85"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
