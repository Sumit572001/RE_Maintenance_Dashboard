import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid } from 'lucide-react'
import { ChartRequestTypeSelect } from './ChartRequestTypeSelect'

const TARGET_STATUSES = ['Pending', 'Assigned', 'Completed', 'Closed']

export function HeatmapTable({
  data = [],
  onCellClick,
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL'
}) {
  const { topTypes, matrix, maxCount } = useMemo(() => {
    if (!data.length) return { topTypes: [], matrix: {}, maxCount: 1 }

    // Count frequency of Request Types
    const typeTotals = {}
    data.forEach((item) => {
      const type = item.requestType || 'Unspecified'
      typeTotals[type] = (typeTotals[type] || 0) + 1
    })

    const sortedTypes = Object.entries(typeTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([type]) => type)

    // Build matrix [type][status] -> count
    const mat = {}
    let max = 0

    sortedTypes.forEach((type) => {
      mat[type] = { Pending: 0, Assigned: 0, Completed: 0, Closed: 0 }
    })

    data.forEach((item) => {
      const type = item.requestType || 'Unspecified'
      const status = item.status || 'Pending'
      if (mat[type] && TARGET_STATUSES.includes(status)) {
        mat[type][status] += 1
        if (mat[type][status] > max) {
          max = mat[type][status]
        }
      }
    })

    return { topTypes: sortedTypes, matrix: mat, maxCount: max || 1 }
  }, [data])

  // Get background color intensity for cell count
  const getCellStyle = (count) => {
    if (count === 0) {
      return { backgroundColor: '#f8fafc', color: '#94a3b8', border: '1px solid #f1f5f9' }
    }

    const intensity = Math.min(count / maxCount, 1)
    const alpha = 0.15 + intensity * 0.75
    return {
      backgroundColor: `rgba(249, 115, 22, ${alpha})`,
      color: intensity > 0.4 ? '#ffffff' : '#c2410c',
      fontWeight: count > 10 ? 700 : 600
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col col-span-full overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Request Type Heatmap Matrix
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-16 h-2.5 rounded-full bg-gradient-to-r from-orange-100 to-orange-500" />
            <span>Density</span>
          </div>
        </div>
      </div>

      {topTypes.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No heatmap data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/80">
                <th className="py-3.5 px-4 rounded-tl-xl text-slate-900">Request Type (Top 15)</th>
                {TARGET_STATUSES.map((st) => (
                  <th key={st} className="py-3.5 px-4 text-center w-32 text-slate-800">
                    {st}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {topTypes.map((type, idx) => (
                <tr key={type} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-sm text-slate-900">
                    <span className="text-slate-500 font-mono text-xs mr-2 font-normal">#{idx + 1}</span>
                    {type}
                  </td>
                  {TARGET_STATUSES.map((st) => {
                    const count = matrix[type]?.[st] || 0
                    const style = getCellStyle(count)
                    return (
                      <td key={st} className="py-2 px-3 text-center">
                        <div
                          style={style}
                          onClick={() => count > 0 && onCellClick && onCellClick(type, st)}
                          className={`w-full py-1.5 rounded-lg text-sm font-mono transition-all duration-200 shadow-xs ${count > 0 ? 'cursor-pointer hover:scale-105 hover:ring-2 hover:ring-orange-400' : 'cursor-default'}`}
                          title={`${type} - ${st}: ${count} requests`}
                        >
                          {count.toLocaleString()}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
