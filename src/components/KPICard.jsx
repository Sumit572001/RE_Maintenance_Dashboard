import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle2, XCircle, Ban, Percent, CalendarDays } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp'

const KPI_CONFIG = {
  total: {
    label: 'Total Requests',
    icon: FileText,
    gradient: 'from-blue-50/50 to-transparent',
    border: 'border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
    numberColor: 'text-blue-600'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    gradient: 'from-emerald-50/50 to-transparent',
    border: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    numberColor: 'text-emerald-600'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    gradient: 'from-amber-50/50 to-transparent',
    border: 'border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
    numberColor: 'text-amber-600'
  },
  cancel: {
    label: 'Cancel',
    icon: XCircle,
    gradient: 'from-red-50/50 to-transparent',
    border: 'border-red-200 hover:border-red-400',
    iconBg: 'bg-red-50 text-red-600 border border-red-100',
    numberColor: 'text-red-600'
  },
  reject: {
    label: 'Reject',
    icon: Ban,
    gradient: 'from-rose-50/50 to-transparent',
    border: 'border-rose-200 hover:border-rose-400',
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
    numberColor: 'text-rose-600'
  },
  closure: {
    label: 'Closure',
    icon: Percent,
    gradient: 'from-indigo-50/50 to-transparent',
    border: 'border-indigo-200 hover:border-indigo-400',
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    numberColor: 'text-indigo-600'
  },
  avgAge: {
    label: 'Avg Age (Days)',
    icon: CalendarDays,
    gradient: 'from-purple-50/50 to-transparent',
    border: 'border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
    numberColor: 'text-purple-600'
  }
}

export function KPICard({ type, rawValue = 0, index = 0, isFloat = false, isPercent = false, onClick }) {
  const config = KPI_CONFIG[type] || KPI_CONFIG.total
  const Icon = config.icon

  const numericValue = typeof rawValue === 'number' && !isNaN(rawValue) ? rawValue : (parseFloat(rawValue) || 0)

  // Count up value
  const animatedValue = useCountUp(numericValue, 1000, isFloat || isPercent)

  // Format value for display
  let displayValue
  if (isPercent) {
    displayValue = `${(animatedValue || 0).toFixed(2)}%`
  } else if (isFloat) {
    displayValue = (animatedValue || 0).toFixed(2)
  } else {
    displayValue = (Math.floor(animatedValue) || 0).toLocaleString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      onClick={onClick}
      className={`relative overflow-hidden bg-white border ${config.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Background glow overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-600 mb-1">
            {config.label}
          </p>
          <h3 className={`text-3xl font-extrabold tracking-tight ${config.numberColor}`}>
            {displayValue}
          </h3>
        </div>

        <div className={`p-3 rounded-xl ${config.iconBg} shadow-sm shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  )
}

