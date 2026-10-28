import React from 'react'
import { Tag } from 'lucide-react'

export function ChartRequestTypeSelect({
  selectedType = 'ALL',
  onTypeChange,
  requestTypes = [],
  selectedGroup = 'ALL'
}) {
  // If no options or requestTypes is empty, don't render
  if (!requestTypes || requestTypes.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 bg-purple-50/90 hover:bg-purple-100/90 border border-purple-200 rounded-xl px-2.5 py-1 text-xs shadow-2xs transition-all">
      <Tag className="w-3.5 h-3.5 text-purple-600 shrink-0" />
      <select
        value={selectedType}
        onChange={(e) => onTypeChange && onTypeChange(e.target.value)}
        className="bg-transparent text-purple-900 font-medium text-xs focus:outline-none cursor-pointer max-w-[180px] truncate"
        title={selectedGroup !== 'ALL' ? `Sub-Problems for ${selectedGroup}` : 'Filter by Problem Request Type'}
      >
        <option value="ALL">
          {selectedGroup !== 'ALL' ? `All ${selectedGroup} Types` : 'All Problem Types'} ({requestTypes.length})
        </option>
        {requestTypes.map((type) => (
          <option key={type} value={type} className="bg-white text-slate-800 font-semibold py-1">
            {type}
          </option>
        ))}
      </select>
    </div>
  )
}
