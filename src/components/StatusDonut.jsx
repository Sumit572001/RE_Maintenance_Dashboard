import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'

const STATUS_COLORS = {
  Pending: '#f97316',    // Orange
  Assigned: '#3b82f6',   // Blue
  Completed: '#22c55e',  // Green
  Closed: '#a855f7',     // Purple
  Reassigned: '#eab308', // Yellow
  Cancelled: '#ef4444',  // Red
  Declined: '#ec4899',   // Pink
  Reopened: '#06b6d4'    // Cyan
}

const DEFAULT_COLOR = '#64748b'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-xs font-bold text-slate-800">{data.name}</span>
        </div>
        <p className="text-sm font-semibold text-slate-900">
          {data.value.toLocaleString()} <span className="text-xs font-normal text-slate-500">requests</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {data.percentage}% of total filtered
        </p>
      </div>
    )
  }
  return null
}

export function StatusDonut({
  data = [],
  onPieClick,
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL'
}) {
  const chartData = useMemo(() => {
    if (!data.length) return []

    const statusCounts = {}
    data.forEach((item) => {
      const st = item.status || 'Pending'
      statusCounts[st] = (statusCounts[st] || 0) + 1
    })

    const total = data.length

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status,
        value: count,
        percentage: ((count / total) * 100).toFixed(1),
        color: STATUS_COLORS[status] || DEFAULT_COLOR
      }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[410px]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Status Distribution</h3>
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
          No status data available
        </div>
      ) : (
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    onClick={() => onPieClick && onPieClick(entry.name)}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={42}
                formatter={(value, entry) => (
                  <span className="text-sm text-slate-800 font-semibold ml-1">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Overlay Stats */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
            <span className="text-3xl font-extrabold text-slate-900">{data.length.toLocaleString()}</span>
            <span className="text-[11px] uppercase tracking-widest text-slate-600 font-bold">Total</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
