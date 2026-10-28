import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '../components/Header'
import { KPICard } from '../components/KPICard'
import { FilterBar } from '../components/FilterBar'
import { QuarterComparisonCard } from '../components/QuarterComparisonCard'
import { ProjectBarChart } from '../components/ProjectBarChart'
import { CategoryBarChart } from '../components/CategoryBarChart'
import { HeatmapTable } from '../components/HeatmapTable'
import { TatBarChart } from '../components/TatBarChart'
import { FeedbackBarChart } from '../components/FeedbackBarChart'
import { DataTable } from '../components/DataTable'
import { DetailModal } from '../components/DetailModal'
import { FilteredRecordsModal } from '../components/FilteredRecordsModal'
import { AIAssistantDrawer } from '../components/AIAssistantDrawer'
import { useExcelData } from '../hooks/useExcelData'

export function Dashboard({ rawData, fileName, onUploadNew }) {
  const {
    filters,
    setFilters,
    filterOptions,
    activeFiltersCount,
    resetFilters,
    searchQuery,
    setSearchQuery,
    filteredData,
    kpiMetrics
  } = useExcelData(rawData)

  const [selectedRecord, setSelectedRecord] = useState(null)
  const [drillDownModal, setDrillDownModal] = useState({ isOpen: false, title: '', records: [] })
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [showQuarterCard, setShowQuarterCard] = useState(false)

  // Drill-down handlers for chart clicks
  const handleProjectClick = (projectName) => {
    const records = filteredData.filter((item) => item.projectName === projectName)
    setDrillDownModal({
      isOpen: true,
      title: `Requests for Project: "${projectName}"`,
      records
    })
  }

  const handleStatusClick = (statusName) => {
    const records = filteredData.filter((item) => item.status === statusName)
    setDrillDownModal({
      isOpen: true,
      title: `Requests with Status: "${statusName}"`,
      records
    })
  }

  const handleCategoryClick = (categoryName, type) => {
    if (type === 'requestType') {
      const records = filteredData.filter((item) => item.requestType === categoryName)
      setDrillDownModal({
        isOpen: true,
        title: `Requests for Request Type: "${categoryName}"`,
        records
      })
      return
    }

    let records = filteredData.filter((item) => item.requestGroup === categoryName)
    let modalTitle = `Requests for Category: "${categoryName}"`

    // Fallback: If no records match requestGroup, check if categoryName matches requestType
    if (records.length === 0) {
      const typeRecords = filteredData.filter((item) => item.requestType === categoryName)
      if (typeRecords.length > 0) {
        records = typeRecords
        modalTitle = `Requests for Request Type: "${categoryName}"`
      }
    }

    setDrillDownModal({
      isOpen: true,
      title: modalTitle,
      records
    })
  }

  const handleRequestTypeClick = (typeName) => {
    const records = filteredData.filter((item) => item.requestType === typeName)
    setDrillDownModal({
      isOpen: true,
      title: `Requests for Request Type: "${typeName}"`,
      records
    })
  }

  const handleZoneCompareClick = (categoryName, zoneKey) => {
    const records = filteredData.filter((item) => {
      if (item.requestGroup !== categoryName) return false
      const zone = (item.zoneName || '').toLowerCase()
      if (zoneKey === 'Nagar Road') return zone.includes('nagar')
      if (zoneKey === 'County') return zone.includes('county')
      return true
    })
    setDrillDownModal({
      isOpen: true,
      title: `Requests for "${categoryName}" in Zone: "${zoneKey}"`,
      records
    })
  }

  const handleHeatmapCellClick = (requestType, statusName) => {
    const records = filteredData.filter(
      (item) => item.requestType === requestType && item.status === statusName
    )
    setDrillDownModal({
      isOpen: true,
      title: `Requests for Type: "${requestType}" — Status: "${statusName}"`,
      records
    })
  }

  const handleFeedbackClick = (feedbackCategory) => {
    const records = filteredData.filter((item) => {
      const fbStr = String(item.feedbacks || item.feedbackComments || '').toLowerCase().trim()
      if (feedbackCategory === 'No Feedback') {
        return !fbStr || fbStr === '-' || fbStr === 'n/a' || fbStr === 'none' || fbStr === 'null' || fbStr === '(blanks)'
      } else if (feedbackCategory === 'Excellent') {
        return fbStr.includes('excellent') || fbStr === '5'
      } else if (feedbackCategory === 'Good') {
        return fbStr === 'good' || (fbStr.includes('good') && !fbStr.includes('below')) || fbStr === '4'
      } else if (feedbackCategory === 'Satisfactory') {
        return fbStr.includes('satisf')
      } else if (feedbackCategory === 'Average') {
        return fbStr === 'average' || (fbStr.includes('average') && !fbStr.includes('below')) || fbStr === '3'
      } else if (feedbackCategory === 'Below Average') {
        return (
          fbStr.includes('below') ||
          fbStr.includes('poor') ||
          fbStr.includes('bad') ||
          fbStr.includes('unsatisfied') ||
          fbStr.includes('dissatisfied') ||
          fbStr === '1' ||
          fbStr === '2'
        )
      }
      return true
    })

    setDrillDownModal({
      isOpen: true,
      title: `Requests with Feedback: "${feedbackCategory}"`,
      records
    })
  }

  const handleTatBucketClick = (bucketLabel, min, max) => {
    const records = filteredData.filter((item) => {
      const tat = item.tatDays || item.ageInDays || 0
      if (max === null) return tat > min
      return tat >= min && tat <= max
    })
    setDrillDownModal({
      isOpen: true,
      title: `Requests with TAT Range: "${bucketLabel}"`,
      records
    })
  }

  const chartProps = {
    selectedType: filters.requestType,
    onTypeChange: (val) => setFilters((prev) => ({ ...prev, requestType: val })),
    requestTypes: filterOptions.requestTypes,
    selectedGroup: filters.requestGroup,
    selectedQuarter: filters.quarter,
    quarterMode: filters.quarterMode,
    onSelectQuarter: (qId) =>
      setFilters((prev) => ({
        ...prev,
        quarter: prev.quarter === qId ? 'ALL' : qId
      }))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Sticky Top Header with Shifted Quarter Options & Toggle Button */}
      <Header
        fileName={fileName}
        totalRecords={rawData.length}
        onUploadNew={onUploadNew}
        onOpenAIAssistant={() => setIsAIOpen(true)}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        showQuarterCard={showQuarterCard}
        onToggleQuarterCard={() => setShowQuarterCard((prev) => !prev)}
        onShowQuarterCard={setShowQuarterCard}
      />

      {/* Main Container - Expanded width to utilize screen side spaces */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards Row (7 cards) */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}
        >
          <KPICard
            type="total"
            rawValue={kpiMetrics.total}
            index={0}
            onClick={() => {
              setDrillDownModal({
                isOpen: true,
                title: 'All Filtered Maintenance Requests',
                records: filteredData
              })
            }}
          />
          <KPICard
            type="completed"
            rawValue={kpiMetrics.completed}
            index={1}
            onClick={() => {
              const records = filteredData.filter((item) => {
                const s = (item.status || '').toLowerCase()
                return s.includes('complete') || s.includes('close') || s.includes('resolve')
              })
              setDrillDownModal({
                isOpen: true,
                title: 'Completed & Resolved Requests',
                records
              })
            }}
          />
          <KPICard
            type="pending"
            rawValue={kpiMetrics.pending}
            index={2}
            onClick={() => {
              const records = filteredData.filter((item) => {
                const s = (item.status || '').toLowerCase()
                return (
                  !s.includes('cancel') &&
                  !s.includes('reject') &&
                  !s.includes('declin') &&
                  !s.includes('complete') &&
                  !s.includes('close') &&
                  !s.includes('resolve')
                )
              })
              setDrillDownModal({
                isOpen: true,
                title: 'Pending & In-Progress Requests',
                records
              })
            }}
          />
          <KPICard
            type="cancel"
            rawValue={kpiMetrics.cancel}
            index={3}
            onClick={() => {
              const records = filteredData.filter((item) => (item.status || '').toLowerCase().includes('cancel'))
              setDrillDownModal({
                isOpen: true,
                title: 'Cancelled Requests',
                records
              })
            }}
          />
          <KPICard
            type="reject"
            rawValue={kpiMetrics.reject}
            index={4}
            onClick={() => {
              const records = filteredData.filter((item) => {
                const s = (item.status || '').toLowerCase()
                return s.includes('reject') || s.includes('declin')
              })
              setDrillDownModal({
                isOpen: true,
                title: 'Rejected Requests',
                records
              })
            }}
          />
          <KPICard
            type="closure"
            rawValue={kpiMetrics.closure}
            index={5}
            isPercent
            onClick={() => {
              const records = filteredData.filter((item) => {
                const s = (item.status || '').toLowerCase()
                return s.includes('complete') || s.includes('close') || s.includes('resolve')
              })
              setDrillDownModal({
                isOpen: true,
                title: `Closure Requests (${kpiMetrics.completed} of ${kpiMetrics.total})`,
                records
              })
            }}
          />
          <KPICard type="avgAge" rawValue={kpiMetrics.avgAge} index={6} isFloat />
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          activeCount={activeFiltersCount}
          onReset={resetFilters}
        />

        {/* Quarter-Wise Performance Breakdown (3 Months per Quarter) - Shown when user clicks Quarter button */}
        <AnimatePresence>
          {showQuarterCard && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <QuarterComparisonCard
                quarterStats={filterOptions.quarterStats}
                selectedQuarter={filters.quarter}
                onSelectQuarter={(qId) =>
                  setFilters((prev) => ({
                    ...prev,
                    quarter: prev.quarter === qId ? 'ALL' : qId
                  }))
                }
                selectedYear={filters.year}
                onYearChange={(yr) => setFilters((prev) => ({ ...prev, year: yr }))}
                years={filterOptions.years}
                quarterMode={filters.quarterMode}
                onToggleQuarterMode={() =>
                  setFilters((prev) => ({
                    ...prev,
                    quarterMode: prev.quarterMode === 'calendar' ? 'fiscal' : 'calendar'
                  }))
                }
                totalRecords={rawData.length}
                onClose={() => setShowQuarterCard(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Projects Bar Chart */}
          <ProjectBarChart data={filteredData} onBarClick={handleProjectClick} {...chartProps} />

          {/* Request Group Category Breakdown (with integrated Zone Compare tab) */}
          <CategoryBarChart
            data={filteredData}
            onBarClick={handleCategoryClick}
            onRequestTypeBarClick={handleRequestTypeClick}
            onZoneBarClick={handleZoneCompareClick}
            {...chartProps}
          />

          {/* Turnaround Time (TAT = Completion Date - Raised On) Bar Chart (with integrated TAT Distribution view) */}
          <TatBarChart
            data={filteredData}
            onBarClick={handleProjectClick}
            onBucketClick={handleTatBucketClick}
            {...chartProps}
          />

          {/* Customer Feedback Analysis Bar Chart */}
          <FeedbackBarChart data={filteredData} onBarClick={handleFeedbackClick} {...chartProps} />

          {/* Request Type Heatmap Matrix */}
          <HeatmapTable data={filteredData} onCellClick={handleHeatmapCellClick} {...chartProps} />
        </div>

        {/* Paginated Sortable Data Table */}
        <DataTable
          data={filteredData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRowClick={(row) => setSelectedRecord(row)}
          selectedQuarter={filters.quarter}
          quarterMode={filters.quarterMode}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        RE Maintenance Analytics Dashboard &copy; {new Date().getFullYear()} — In-Browser SheetJS Processing
      </footer>

      {/* Floating Chart Drill-Down Modal */}
      <FilteredRecordsModal
        isOpen={drillDownModal.isOpen}
        title={drillDownModal.title}
        records={drillDownModal.records}
        selectedQuarter={filters.quarter}
        quarterMode={filters.quarterMode}
        onClose={() => setDrillDownModal({ isOpen: false, title: '', records: [] })}
        onRecordClick={(row) => setSelectedRecord(row)}
      />

      {/* Record Inspector Modal */}
      {selectedRecord && (
        <DetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* AI Assistant Chat Drawer */}
      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onOpen={() => setIsAIOpen(true)}
        filteredData={filteredData}
        rawData={rawData}
        onOpenDrillDown={(title, records) => setDrillDownModal({ isOpen: true, title, records })}
      />
    </div>
  )
}
