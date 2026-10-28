import { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'

/**
 * Helper to safely extract field values matching flexible column aliases
 */
function getFieldValue(row, possibleKeys) {
  if (!row || typeof row !== 'object') return ''
  const rowKeys = Object.keys(row)

  // 1. Direct match check
  for (const pKey of possibleKeys) {
    if (row[pKey] !== undefined && row[pKey] !== null && String(row[pKey]).trim() !== '') {
      return String(row[pKey]).trim()
    }
  }

  // 2. Normalized key match check (lowercase, alphanumeric only)
  const normalizedRowMap = {}
  rowKeys.forEach((rk) => {
    const cleanKey = rk.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (row[rk] !== undefined && row[rk] !== null) {
      normalizedRowMap[cleanKey] = String(row[rk]).trim()
    }
  })

  for (const pKey of possibleKeys) {
    const cleanPKey = pKey.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalizedRowMap[cleanPKey] !== undefined && normalizedRowMap[cleanPKey] !== '') {
      return normalizedRowMap[cleanPKey]
    }
  }

  // 3. Substring match check
  for (const rk of rowKeys) {
    const rkLower = rk.toLowerCase()
    for (const pKey of possibleKeys) {
      const pLower = pKey.toLowerCase()
      if (rkLower.includes(pLower) || pLower.includes(rkLower)) {
        if (row[rk] !== undefined && row[rk] !== null && String(row[rk]).trim() !== '') {
          return String(row[rk]).trim()
        }
      }
    }
  }

  return ''
}

/**
 * Dynamic Excel parser supporting header row auto-detection and flexible column names
 */
export const parseExcel = (dataInput) => {
  return new Promise((resolve, reject) => {
    try {
      let workbook
      if (dataInput instanceof ArrayBuffer || dataInput instanceof Uint8Array) {
        workbook = XLSX.read(dataInput, { type: 'array', cellDates: true })
      } else {
        reject(new Error('Invalid file format input'))
        return
      }

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Extract raw matrix to detect header row dynamically
      const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

      if (!matrix || matrix.length === 0) {
        resolve([])
        return
      }

      // Keywords that typically appear in the header row
      const headerKeywords = [
        'status', 'request', 'ticket', 'project', 'building', 'unit',
        'group', 'category', 'type', 'raised', 'assigned', 'zone',
        'age', 'delay', 'date', 'description', 'priority', 'remark', 'number'
      ]

      let bestHeaderRowIndex = 0
      let maxScore = -1

      // Search top 25 rows for best header candidate
      const searchLimit = Math.min(25, matrix.length)
      for (let r = 0; r < searchLimit; r++) {
        const rowCells = matrix[r]
        if (!Array.isArray(rowCells)) continue

        let score = 0
        rowCells.forEach((cell) => {
          const str = String(cell || '').toLowerCase().trim()
          if (!str) return
          headerKeywords.forEach((kw) => {
            if (str.includes(kw)) score++
          })
        })

        if (score > maxScore) {
          maxScore = score
          bestHeaderRowIndex = r
        }
      }

      // Fallback if no matching score
      if (maxScore <= 1) {
        bestHeaderRowIndex = matrix.length > 4 ? 4 : 0
      }

      // Extract JSON using detected header row
      const rawJson = XLSX.utils.sheet_to_json(worksheet, {
        range: bestHeaderRowIndex,
        defval: '',
        raw: false
      })

      // Clean & normalize records
      const parsedData = rawJson.map((row, index) => {
        const requestNumber = getFieldValue(row, ['Request Number', 'Request No', 'Req No', 'Request ID', 'Ticket No', 'Complaint No', 'ID', 'Sr No', 'Ref No']) || `REQ-${index + 1}`
        const raisedBy = getFieldValue(row, ['Raised By', 'Created By', 'Customer Name', 'User', 'Requester', 'RaisedBy'])
        const raisedByEmail = getFieldValue(row, ['Raised By Email', 'Email', 'Created By Email', 'Requester Email'])
        const raisedByRole = getFieldValue(row, ['Raised By Role', 'Role', 'Requester Role'])
        const raisedOnRaw = getFieldValue(row, ['Raised On', 'Created Date', 'Date', 'Created On', 'Raised Date', 'Logged Date', 'RaisedOn'])
        const updatedBy = getFieldValue(row, ['Updated By', 'Modified By'])
        const updatedByEmail = getFieldValue(row, ['Updated By Email'])
        const updatedByRole = getFieldValue(row, ['Updated By Role'])
        const updateOn = getFieldValue(row, ['Update On', 'Updated On', 'Modified Date'])
        const assignedTo = getFieldValue(row, ['Assigned To', 'Assignee', 'Technician', 'Vendor'])
        const assignedToEmail = getFieldValue(row, ['Assigned To Email'])
        const requestFor = getFieldValue(row, ['Request For'])
        const zoneName = getFieldValue(row, ['Zone name', 'Zone Name', 'Zone', 'Location', 'Region']) || 'General Zone'
        const projectName = getFieldValue(row, ['Project Name (Project Code)', 'Project Name', 'Project', 'ProjectCode', 'Site', 'Building / Project', 'Property']) || 'General Project'
        const buildingName = getFieldValue(row, ['Building Name', 'Building', 'Tower', 'Block']) || ''
        const unit = getFieldValue(row, ['Unit', 'Flat No', 'Unit No', 'Unit Number', 'Villa No']) || ''
        const requestGroup = getFieldValue(row, ['Request Group', 'Category', 'Issue Category', 'Group', 'Department']) || 'General'
        const requestType = getFieldValue(row, ['Request Type', 'Sub Category', 'Issue Type', 'Type', 'Subcategory']) || 'Other'
        const description = getFieldValue(row, ['Description', 'Issue Description', 'Details', 'Subject'])
        const remark = getFieldValue(row, ['Remark', 'Remarks', 'Comments'])
        const completionRemark = getFieldValue(row, ['Completion Remark', 'Resolution Remark', 'Closing Comment'])
        
        const ageVal = getFieldValue(row, ['Age in Day(s)', 'Age (Days)', 'Age', 'Days', 'Aging', 'Age In Days'])
        const ageInDays = parseInt(ageVal, 10) || 0

        const delayVal = getFieldValue(row, ['Delay Day(s)', 'Delay (Days)', 'Delay', 'Delay Days'])
        const delayDays = parseInt(delayVal, 10) || 0

        const nearingVal = getFieldValue(row, ['Nearing Day(s)', 'Nearing (Days)', 'Nearing Days'])
        const nearingDays = parseInt(nearingVal, 10) || 0

        let statusRaw = getFieldValue(row, ['Status', 'Request Status', 'Ticket Status', 'State', 'Current Status'])
        if (!statusRaw) {
          statusRaw = 'Pending'
        }

        const priorityRaw = getFieldValue(row, ['Priority', 'Severity', 'Priority Level']) || 'Medium'

        const completionDateRaw = getFieldValue(row, ['Completion Date', 'Completed Date', 'Actual Completion Date', 'Completion On', 'Closed Date', 'Resolved Date'])

        // Parse dates
        const parsedDate = parseCustomDate(raisedOnRaw)
        const parsedCompletionDate = parseCustomDate(completionDateRaw)

        let tatDays = 0
        if (parsedCompletionDate && parsedDate) {
          const diffMs = parsedCompletionDate.getTime() - parsedDate.getTime()
          tatDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
        } else if (ageInDays > 0) {
          tatDays = ageInDays
        } else if (parsedDate) {
          const diffMs = new Date().getTime() - parsedDate.getTime()
          tatDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
        }

        const feedbacks = getFieldValue(row, ['Feedbacks', 'Feedback', 'Customer Rating', 'Rating'])
        const feedbackComments = getFieldValue(row, ['Feedback Comments', 'Feedback Comment', 'Review'])

        const quarterCalendar = parsedDate ? getQuarterCode(parsedDate, 'calendar') : ''
        const quarterFiscal = parsedDate ? getQuarterCode(parsedDate, 'fiscal') : ''
        const quarterLabel = parsedDate ? getQuarterDisplay(parsedDate, 'calendar') : ''
        const recordYear = parsedDate ? parsedDate.getFullYear() : null
        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const monthShort = parsedDate ? monthNamesShort[parsedDate.getMonth()] : ''
        const monthFull = parsedDate ? monthNamesFull[parsedDate.getMonth()] : ''
        const monthIndex = parsedDate ? parsedDate.getMonth() : -1

        return {
          id: requestNumber,
          requestNumber,
          raisedBy,
          raisedByEmail,
          raisedByRole,
          raisedOn: raisedOnRaw,
          raisedOnDate: parsedDate,
          monthShort,
          monthFull,
          monthIndex,
          quarterCalendar,
          quarterFiscal,
          quarterLabel,
          recordYear,
          updatedBy,
          updatedByEmail,
          updatedByRole,
          updateOn,
          assignedTo,
          assignedToEmail,
          requestFor,
          zoneName,
          projectName,
          buildingName,
          unit,
          requestGroup,
          requestType,
          description,
          remark,
          completionRemark,
          nearingDays,
          delayDays,
          ageInDays,
          tatDays,
          onHoldMessage: getFieldValue(row, ['On Hold Message', 'Hold Reason']),
          expectedCompletionDate: getFieldValue(row, ['Expected Completion Date', 'Target Date', 'SLA Date']),
          completionDate: completionDateRaw,
          completionDateObj: parsedCompletionDate,
          preferedVisitDate: getFieldValue(row, ['Prefered Visit Date', 'Visit Date']),
          imageFiles: getFieldValue(row, ['Image Files', 'Attachments']),
          feedbacks,
          feedbackComments,
          note: getFieldValue(row, ['Note', 'Notes']),
          noteCreatedBy: getFieldValue(row, ['Note Created By']),
          message: getFieldValue(row, ['Message']),
          messageLocation: getFieldValue(row, ['Message Location']),
          messagePostedBy: getFieldValue(row, ['Message Posted By']),
          escalationLevel: getFieldValue(row, ['Escalation Level', 'Escalation']),
          reasonForEscalation: getFieldValue(row, ['Reason For Escalation']),
          escalatedTo: getFieldValue(row, ['Escalated To']),
          rule: getFieldValue(row, ['Rule']),
          status: statusRaw,
          priority: priorityRaw,
          customFields: getFieldValue(row, ['Custom Fields']),
          originalRow: row
        }
      })

      resolve(parsedData)
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Quarter configuration definitions: Calendar Year (Jan-Dec) and Financial Year (Apr-Mar)
 * 3 Months per Quarter
 */
export const QUARTER_DEFINITIONS = {
  calendar: [
    { id: 'Q1', name: 'Q1', months: 'Jan - Mar', monthRange: [0, 1, 2], label: 'Q1 (Jan - Mar)' },
    { id: 'Q2', name: 'Q2', months: 'Apr - Jun', monthRange: [3, 4, 5], label: 'Q2 (Apr - Jun)' },
    { id: 'Q3', name: 'Q3', months: 'Jul - Sep', monthRange: [6, 7, 8], label: 'Q3 (Jul - Sep)' },
    { id: 'Q4', name: 'Q4', months: 'Oct - Dec', monthRange: [9, 10, 11], label: 'Q4 (Oct - Dec)' }
  ],
  fiscal: [
    { id: 'Q1', name: 'Q1', months: 'Apr - Jun', monthRange: [3, 4, 5], label: 'Q1 (Apr - Jun)' },
    { id: 'Q2', name: 'Q2', months: 'Jul - Sep', monthRange: [6, 7, 8], label: 'Q2 (Jul - Sep)' },
    { id: 'Q3', name: 'Q3', months: 'Oct - Dec', monthRange: [9, 10, 11], label: 'Q3 (Oct - Dec)' },
    { id: 'Q4', name: 'Q4', months: 'Jan - Mar', monthRange: [0, 1, 2], label: 'Q4 (Jan - Mar)' }
  ]
}

/**
 * Extract quarter identifier ('Q1', 'Q2', 'Q3', 'Q4') based on date and quarterMode
 */
export function getQuarterCode(date, quarterMode = 'calendar') {
  if (!date || isNaN(date.getTime())) return ''
  const m = date.getMonth()
  if (quarterMode === 'fiscal') {
    if (m >= 3 && m <= 5) return 'Q1'
    if (m >= 6 && m <= 8) return 'Q2'
    if (m >= 9 && m <= 11) return 'Q3'
    return 'Q4'
  } else {
    if (m >= 0 && m <= 2) return 'Q1'
    if (m >= 3 && m <= 5) return 'Q2'
    if (m >= 6 && m <= 8) return 'Q3'
    return 'Q4'
  }
}

/**
 * Returns a human-friendly quarter string e.g. "Q2 2024 (Apr - Jun)"
 */
export function getQuarterDisplay(date, quarterMode = 'calendar') {
  if (!date || isNaN(date.getTime())) return '-'
  const q = getQuarterCode(date, quarterMode)
  const y = date.getFullYear()
  const defs = QUARTER_DEFINITIONS[quarterMode] || QUARTER_DEFINITIONS.calendar
  const found = defs.find((d) => d.id === q)
  const months = found ? found.months : ''
  return `${q} ${y} (${months})`
}

/**
 * Parse date values safely supporting Date objects, numeric Excel serials,
 * DD-MM-YYYY, YYYY-MM-DD, and standard timestamps.
 */
export function parseCustomDate(dateVal) {
  if (!dateVal) return null

  // 1. If already Date object
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal
  }

  // 2. If numeric Excel serial number
  if (typeof dateVal === 'number' || (!isNaN(dateVal) && !isNaN(parseFloat(dateVal)) && Number(dateVal) > 30000 && Number(dateVal) < 70000)) {
    const num = Number(dateVal)
    const ms = Math.round((num - 25569) * 86400 * 1000)
    const d = new Date(ms)
    return isNaN(d.getTime()) ? null : d
  }

  const dateStr = String(dateVal).trim()
  if (!dateStr) return null

  // 3. Format: "26-07-2024 10:30 AM" or "26-07-2024" or "26/07/2024"
  const dmyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    const year = parseInt(dmyMatch[3], 10)

    let hours = 0
    let minutes = 0
    const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i)
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3]
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0
      }
    }
    const d = new Date(year, month, day, hours, minutes)
    if (!isNaN(d.getTime())) return d
  }

  // 4. Format: "2024-07-26" or "2024/07/26"
  const ymdMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10)
    const month = parseInt(ymdMatch[2], 10) - 1
    const day = parseInt(ymdMatch[3], 10)

    let hours = 0
    let minutes = 0
    const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i)
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3]
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0
      }
    }
    const d = new Date(year, month, day, hours, minutes)
    if (!isNaN(d.getTime())) return d
  }

  const fallback = new Date(dateStr)
  return isNaN(fallback.getTime()) ? null : fallback
}

export function useExcelData(rawData = []) {
  // Filter States (Including Year & 3-Month Quarter filters)
  const [filters, setFilters] = useState({
    zone: 'ALL',
    project: 'ALL',
    status: 'ALL',
    requestGroup: 'ALL',
    priority: 'ALL',
    requestType: 'ALL',
    year: 'ALL',
    quarter: 'ALL',
    quarterMode: 'calendar', // 'calendar' (Jan-Dec) | 'fiscal' (Apr-Mar)
    dateFrom: '',
    dateTo: ''
  })

  // Table Search & Sort state
  const [searchQuery, setSearchQuery] = useState('')

  // Unique filter option lists extracted from rawData
  const filterOptions = useMemo(() => {
    if (!rawData.length) {
      return {
        zones: [],
        projects: [],
        statuses: [],
        requestGroups: [],
        priorities: [],
        requestTypes: [],
        typesByGroup: {},
        years: [],
        quarterOptions: [],
        quarterCounts: { ALL: 0, Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        quarterStats: []
      }
    }

    const zonesSet = new Set()
    const projectsSet = new Set()
    const statusesSet = new Set()
    const groupsSet = new Set()
    const prioritiesSet = new Set()
    const typesSet = new Set()
    const typesByGroup = {}
    const yearsSet = new Set()

    rawData.forEach((item) => {
      if (item.zoneName) zonesSet.add(item.zoneName)
      if (item.projectName) projectsSet.add(item.projectName)
      if (item.status) statusesSet.add(item.status)
      if (item.priority) prioritiesSet.add(item.priority)

      if (item.requestGroup) {
        groupsSet.add(item.requestGroup)
        if (!typesByGroup[item.requestGroup]) {
          typesByGroup[item.requestGroup] = new Set()
        }
        if (item.requestType) {
          typesByGroup[item.requestGroup].add(item.requestType)
        }
      }

      if (item.requestType) typesSet.add(item.requestType)

      if (item.raisedOnDate) {
        yearsSet.add(item.raisedOnDate.getFullYear())
      }
    })

    // Compute requestTypes dependent on active requestGroup filter
    let activeRequestTypes = Array.from(typesSet)
    if (filters.requestGroup !== 'ALL' && typesByGroup[filters.requestGroup]) {
      activeRequestTypes = Array.from(typesByGroup[filters.requestGroup])
    }

    const formattedTypesByGroup = {}
    Object.keys(typesByGroup).forEach((grp) => {
      formattedTypesByGroup[grp] = Array.from(typesByGroup[grp]).sort()
    })

    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a)

    // Compute Quarter counts & stats (respecting selected Year if any)
    const defs = QUARTER_DEFINITIONS[filters.quarterMode] || QUARTER_DEFINITIONS.calendar
    const quarterCounts = { ALL: 0, Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
    const quarterRecordGroups = { Q1: [], Q2: [], Q3: [], Q4: [] }

    rawData.forEach((item) => {
      if (filters.year !== 'ALL' && item.raisedOnDate && String(item.raisedOnDate.getFullYear()) !== String(filters.year)) {
        return
      }

      quarterCounts.ALL++

      if (item.raisedOnDate) {
        const qCode = getQuarterCode(item.raisedOnDate, filters.quarterMode)
        if (quarterCounts[qCode] !== undefined) {
          quarterCounts[qCode]++
          quarterRecordGroups[qCode].push(item)
        }
      }
    })

    // Build comprehensive quarter metrics array for Quarter Performance Overview
    const quarterStats = defs.map((qDef) => {
      const list = quarterRecordGroups[qDef.id] || []
      const total = list.length
      let completed = 0
      let pending = 0
      let cancel = 0
      let reject = 0
      let totalAge = 0

      list.forEach((item) => {
        const st = String(item.status || '').toLowerCase().trim()
        if (st.includes('cancel')) {
          cancel++
        } else if (st.includes('reject') || st.includes('declin')) {
          reject++
        } else if (st.includes('complete') || st.includes('close') || st.includes('resolve')) {
          completed++
        } else {
          pending++
        }
        totalAge += (item.ageInDays || 0)
      })

      const closure = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0
      const avgAge = total > 0 ? Math.round((totalAge / total) * 100) / 100 : 0

      return {
        ...qDef,
        count: total,
        total,
        completed,
        pending,
        cancel,
        reject,
        closure,
        avgAge
      }
    })

    const quarterOptions = defs.map((d) => ({
      id: d.id,
      label: `${d.name} (${d.months})`,
      months: d.months,
      name: d.name,
      count: quarterCounts[d.id] || 0
    }))

    return {
      zones: Array.from(zonesSet).sort(),
      projects: Array.from(projectsSet).sort(),
      statuses: Array.from(statusesSet).sort(),
      requestGroups: Array.from(groupsSet).sort(),
      priorities: Array.from(prioritiesSet).sort(),
      requestTypes: activeRequestTypes.sort(),
      typesByGroup: formattedTypesByGroup,
      years: sortedYears,
      quarterOptions,
      quarterCounts,
      quarterStats
    }
  }, [rawData, filters.requestGroup, filters.year, filters.quarterMode])

  // Count active filters (including Year & Quarter)
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.zone !== 'ALL') count++
    if (filters.project !== 'ALL') count++
    if (filters.status !== 'ALL') count++
    if (filters.requestGroup !== 'ALL') count++
    if (filters.priority !== 'ALL') count++
    if (filters.requestType !== 'ALL') count++
    if (filters.year !== 'ALL') count++
    if (filters.quarter !== 'ALL') count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }, [filters])

  // Reset filters
  const resetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      zone: 'ALL',
      project: 'ALL',
      status: 'ALL',
      requestGroup: 'ALL',
      priority: 'ALL',
      requestType: 'ALL',
      year: 'ALL',
      quarter: 'ALL',
      dateFrom: '',
      dateTo: ''
    }))
    setSearchQuery('')
  }

  // Filtered dataset memoized
  const filteredData = useMemo(() => {
    if (!rawData.length) return []

    const fromTime = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null
    const toTime = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59').getTime() : null

    return rawData.filter((item) => {
      if (filters.zone !== 'ALL' && item.zoneName !== filters.zone) return false
      if (filters.project !== 'ALL' && item.projectName !== filters.project) return false
      if (filters.status !== 'ALL' && item.status !== filters.status) return false
      if (filters.requestGroup !== 'ALL' && item.requestGroup !== filters.requestGroup) return false
      if (filters.priority !== 'ALL' && item.priority !== filters.priority) return false
      if (filters.requestType !== 'ALL' && item.requestType !== filters.requestType) return false

      // Year filter
      if (filters.year !== 'ALL') {
        if (!item.raisedOnDate || String(item.raisedOnDate.getFullYear()) !== String(filters.year)) {
          return false
        }
      }

      // Quarter filter (3-Month chunks)
      if (filters.quarter !== 'ALL') {
        if (!item.raisedOnDate) return false
        const qCode = getQuarterCode(item.raisedOnDate, filters.quarterMode)
        if (qCode !== filters.quarter) return false
      }

      // Custom date range filter
      if (fromTime || toTime) {
        if (!item.raisedOnDate) return false
        const t = item.raisedOnDate.getTime()
        if (fromTime && t < fromTime) return false
        if (toTime && t > toTime) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          item.requestNumber.toLowerCase().includes(q) ||
          item.raisedBy.toLowerCase().includes(q) ||
          item.zoneName.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.buildingName.toLowerCase().includes(q) ||
          item.unit.toLowerCase().includes(q) ||
          item.requestGroup.toLowerCase().includes(q) ||
          item.requestType.toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.priority.toLowerCase().includes(q) ||
          String(item.ageInDays).includes(q) ||
          item.raisedOn.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [rawData, filters, searchQuery])

  // Summary Metrics (KPIs)
  const kpiMetrics = useMemo(() => {
    const total = filteredData.length
    if (total === 0) {
      return { total: 0, completed: 0, pending: 0, cancel: 0, reject: 0, closure: 0, avgAge: 0 }
    }

    let completed = 0
    let pending = 0
    let cancel = 0
    let reject = 0
    let totalAge = 0

    filteredData.forEach((item) => {
      const st = String(item.status || '').toLowerCase().trim()

      if (st.includes('cancel')) {
        cancel++
      } else if (st.includes('reject') || st.includes('declin')) {
        reject++
      } else if (st.includes('complete') || st.includes('close') || st.includes('resolve')) {
        completed++
      } else {
        pending++
      }

      totalAge += (item.ageInDays || 0)
    })

    const avgAge = Math.round((totalAge / total) * 100) / 100
    const closure = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0

    return { total, completed, pending, cancel, reject, closure, avgAge }
  }, [filteredData])

  return {
    filters,
    setFilters,
    filterOptions,
    activeFiltersCount,
    resetFilters,
    searchQuery,
    setSearchQuery,
    filteredData,
    kpiMetrics
  }
}

