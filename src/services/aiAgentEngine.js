/**
 * AI Agent Analytics Engine for RE Maintenance Dashboard
 * Processes natural language queries (Hinglish/English) against dataset records.
 */

export function analyzeQuery(userQuery, dataset = [], fullDataset = []) {
  if (!dataset || dataset.length === 0) {
    return {
      text: "⚠️ No data available to analyze right now. Please upload or load an Excel sheet first.",
      matchingRecords: [],
      suggestedQuestions: ["How many total requests are there?", "What are the top projects?"]
    }
  }

  const query = userQuery.toLowerCase().trim()
  const totalRecords = dataset.length

  // Quick stats calculation
  const stats = calculateDatasetStats(dataset)

  // 0. Quarter-Wise (3 Months) Analytics Query
  if (
    query.includes('quarter') ||
    query.includes('quater') ||
    query.includes('q1') ||
    query.includes('q2') ||
    query.includes('q3') ||
    query.includes('q4') ||
    query.includes('3 month') ||
    query.includes('teen mahine')
  ) {
    return generateQuarterAnalysis(dataset, stats, query)
  }

  // 1. Executive Summary / Overview
  if (
    query.includes('summary') ||
    query.includes('overview') ||
    query.includes('kya chal raha') ||
    query.includes('dashboard report') ||
    query.includes('overall') ||
    query.includes('report') ||
    query.includes('health') ||
    query.includes('hall')
  ) {
    return generateExecutiveSummary(dataset, stats)
  }

  // 2. Pending & Status Specific Queries
  if (
    query.includes('pending') ||
    query.includes('open') ||
    query.includes('unresolved') ||
    query.includes('chalu') ||
    query.includes('baki')
  ) {
    return generateStatusAnalysis(dataset, stats, 'Pending')
  }

  if (query.includes('completed') || query.includes('done') || query.includes('solve')) {
    return generateStatusAnalysis(dataset, stats, 'Completed')
  }

  if (query.includes('closed') || query.includes('band')) {
    return generateStatusAnalysis(dataset, stats, 'Closed')
  }

  if (query.includes('assigned')) {
    return generateStatusAnalysis(dataset, stats, 'Assigned')
  }

  // 3. Top Projects / Buildings Query
  if (
    query.includes('project') ||
    query.includes('building') ||
    query.includes('property') ||
    query.includes('konsa project') ||
    query.includes('sabse zyada issue') ||
    query.includes('max complaints')
  ) {
    return generateProjectAnalysis(dataset, stats)
  }

  // 4. Delay / Aging / High Priority / Critical SLA Queries
  if (
    query.includes('delay') ||
    query.includes('aging') ||
    query.includes('age') ||
    query.includes('oldest') ||
    query.includes('slow') ||
    query.includes('late') ||
    query.includes('tat') ||
    query.includes('resolution time') ||
    query.includes('time lag')
  ) {
    return generateDelayAnalysis(dataset, stats)
  }

  if (query.includes('priority') || query.includes('high') || query.includes('critical') || query.includes('urgent')) {
    return generatePriorityAnalysis(dataset, stats)
  }

  // 5. Zone Analysis / Comparison
  if (
    query.includes('zone') ||
    query.includes('nagar road') ||
    query.includes('county') ||
    query.includes('compare')
  ) {
    return generateZoneAnalysis(dataset, stats)
  }

  // 6. Problem Categories & Types (Plumbing, Electrical, Seepage, Civil, etc.)
  if (
    query.includes('problem') ||
    query.includes('category') ||
    query.includes('type') ||
    query.includes('plumbing') ||
    query.includes('electrical') ||
    query.includes('water') ||
    query.includes('leakage') ||
    query.includes('seepage') ||
    query.includes('civil') ||
    query.includes('carpentry') ||
    query.includes('door') ||
    query.includes('lift')
  ) {
    return generateCategoryAnalysis(dataset, stats, query)
  }

  // 7. Customer Feedback Analysis
  if (
    query.includes('feedback') ||
    query.includes('customer') ||
    query.includes('rating') ||
    query.includes('review') ||
    query.includes('satisfied') ||
    query.includes('good') ||
    query.includes('bad') ||
    query.includes('poor')
  ) {
    return generateFeedbackAnalysis(dataset, stats)
  }

  // 8. People / Requesters / Assignees / Escalations
  if (
    query.includes('raised by') ||
    query.includes('who raised') ||
    query.includes('kine raise') ||
    query.includes('assigned to') ||
    query.includes('escalat')
  ) {
    return generatePeopleAnalysis(dataset, stats)
  }

  // 9. Generic Record Search & Fallback Engine
  return generateGenericSearch(dataset, stats, query)
}

/**
 * Calculate dataset distribution metrics
 */
function calculateDatasetStats(dataset) {
  const total = dataset.length

  const statusMap = {}
  const projectMap = {}
  const zoneMap = {}
  const categoryMap = {}
  const typeMap = {}
  const priorityMap = {}

  let totalAge = 0
  let pendingCount = 0
  let closedCount = 0
  let completedCount = 0
  let assignedCount = 0

  dataset.forEach((item) => {
    const s = item.status || 'Unknown'
    statusMap[s] = (statusMap[s] || 0) + 1

    if (s === 'Pending') pendingCount++
    if (s === 'Closed') closedCount++
    if (s === 'Completed') completedCount++
    if (s === 'Assigned') assignedCount++

    const p = item.projectName || 'Unspecified'
    projectMap[p] = (projectMap[p] || 0) + 1

    const z = item.zoneName || 'Unspecified Zone'
    zoneMap[z] = (zoneMap[z] || 0) + 1

    const c = item.requestGroup || 'General'
    categoryMap[c] = (categoryMap[c] || 0) + 1

    const t = item.requestType || 'Other'
    typeMap[t] = (typeMap[t] || 0) + 1

    const prio = item.priority || 'Medium'
    priorityMap[prio] = (priorityMap[prio] || 0) + 1

    totalAge += item.ageInDays || 0
  })

  const avgAge = total > 0 ? (totalAge / total).toFixed(2) : 0

  return {
    total,
    statusMap,
    projectMap,
    zoneMap,
    categoryMap,
    typeMap,
    priorityMap,
    pendingCount,
    closedCount,
    completedCount,
    assignedCount,
    avgAge
  }
}

// Helper to sort objects by count descending
function getTopEntries(mapObj, topN = 5) {
  return Object.entries(mapObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
}

/**
 * 1. Executive Summary Generator
 */
function generateExecutiveSummary(dataset, stats) {
  const topProjects = getTopEntries(stats.projectMap, 3)
  const topCategories = getTopEntries(stats.categoryMap, 3)

  const pendingPct = Math.round((stats.pendingCount / stats.total) * 100)
  const closedPct = Math.round((stats.closedCount / stats.total) * 100)

  const text = `📊 **Executive Summary of Maintenance Dataset**

- **Total Requests Analyzed**: **${stats.total.toLocaleString()}**
- **Pending Issues**: **${stats.pendingCount}** (${pendingPct}%) ⚠️
- **Closed / Resolved**: **${stats.closedCount}** (${closedPct}%) ✅
- **Assigned / In-Progress**: **${stats.assignedCount + stats.completedCount}**
- **Average Issue Age**: **${stats.avgAge} days**

🏢 **Top 3 Projects with Most Requests**:
${topProjects.map(([proj, count], i) => `  ${i + 1}. **${proj}**: ${count} requests (${Math.round((count / stats.total) * 100)}%)`).join('\n')}

🛠️ **Top 3 Problem Categories**:
${topCategories.map(([cat, count], i) => `  ${i + 1}. **${cat}**: ${count} requests`).join('\n')}

💡 *Tip: Click below to view specific pending issues or top project records!*`

  return {
    text,
    matchingRecords: dataset.filter(r => r.status === 'Pending'),
    actionTitle: `View All ${stats.pendingCount} Pending Records`,
    suggestedQuestions: [
      "Which project has the highest pending complaints?",
      "Show delay & aging breakdown",
      "What are the top 5 problem categories?"
    ]
  }
}

/**
 * 2. Status Analysis Generator
 */
function generateStatusAnalysis(dataset, stats, targetStatus) {
  const count = stats.statusMap[targetStatus] || 0
  const percentage = Math.round((count / stats.total) * 100)
  const matchingRecords = dataset.filter((item) => item.status === targetStatus)

  // Find top project for this status
  const projMap = {}
  matchingRecords.forEach((r) => {
    projMap[r.projectName] = (projMap[r.projectName] || 0) + 1
  })
  const topProjects = getTopEntries(projMap, 3)

  // Highest aged item in this status
  const sortedByAge = [...matchingRecords].sort((a, b) => b.ageInDays - a.ageInDays)
  const oldestItem = sortedByAge[0]

  let emoji = targetStatus === 'Pending' ? '⚠️' : targetStatus === 'Closed' ? '✅' : '🔄'

  let text = `${emoji} **${targetStatus} Maintenance Requests Analysis**

- **Total ${targetStatus} Requests**: **${count.toLocaleString()}** out of ${stats.total} (${percentage}%)
`

  if (topProjects.length > 0) {
    text += `\n🏢 **Projects with highest ${targetStatus} count**:\n`
    topProjects.forEach(([proj, c], i) => {
      text += `  ${i + 1}. **${proj}**: ${c} requests\n`
    })
  }

  if (oldestItem) {
    text += `\n⏱️ **Longest ${targetStatus} Complaint**:\n`
    text += `  - Request **#${oldestItem.requestNumber}** (${oldestItem.projectName || 'Project'}) has been open for **${oldestItem.ageInDays} days** (Category: ${oldestItem.requestGroup || 'N/A'}).`
  }

  return {
    text,
    matchingRecords,
    actionTitle: `View ${count} ${targetStatus} Records`,
    suggestedQuestions: [
      "Show projects with maximum complaints",
      "Which complaints are older than 15 days?",
      "What is the average resolution time?"
    ]
  }
}

/**
 * 3. Project Analysis Generator
 */
function generateProjectAnalysis(dataset, stats) {
  const topProjects = getTopEntries(stats.projectMap, 5)

  let text = `🏢 **Top Projects by Request Volume**\n\n`
  topProjects.forEach(([proj, count], idx) => {
    const projRecords = dataset.filter((r) => r.projectName === proj)
    const pending = projRecords.filter((r) => r.status === 'Pending').length
    const closed = projRecords.filter((r) => r.status === 'Closed').length
    text += `**${idx + 1}. ${proj}**: **${count} requests** (${pending} Pending ⚠️ | ${closed} Closed ✅)\n`
  })

  const worstProject = topProjects[0] ? topProjects[0][0] : 'N/A'
  const matchingRecords = dataset.filter((r) => r.projectName === worstProject)

  return {
    text,
    matchingRecords,
    actionTitle: `View Records for ${worstProject}`,
    suggestedQuestions: [
      `What are the complaints in ${worstProject}?`,
      "Show me high priority issues",
      "Which project has the highest aging complaints?"
    ]
  }
}

/**
 * 4. Delay & Aging Analysis Generator
 */
function generateDelayAnalysis(dataset, stats) {
  const sortedByAge = [...dataset].sort((a, b) => (b.ageInDays || 0) - (a.ageInDays || 0))
  const maxAgeItem = sortedByAge[0]

  const over30Days = dataset.filter((r) => (r.ageInDays || 0) > 30)
  const over15Days = dataset.filter((r) => (r.ageInDays || 0) > 15)

  let text = `⏱️ **Resolution Time & Delay Analysis**

- **Average Request Age**: **${stats.avgAge} Days**
- **Critical Delay (>30 Days)**: **${over30Days.length} Requests** 🚨
- **Moderate Delay (>15 Days)**: **${over15Days.length} Requests** ⚠️

`
  if (maxAgeItem) {
    text += `🔴 **Oldest Unresolved Request**:
- **Req ID**: #${maxAgeItem.requestNumber}
- **Age**: **${maxAgeItem.ageInDays} Days**
- **Project**: ${maxAgeItem.projectName} (Unit: ${maxAgeItem.unit || 'N/A'})
- **Category**: ${maxAgeItem.requestGroup} - ${maxAgeItem.requestType}
- **Status**: **${maxAgeItem.status}**`
  }

  return {
    text,
    matchingRecords: over15Days,
    actionTitle: `View ${over15Days.length} Delayed Records (>15 Days)`,
    suggestedQuestions: [
      "Show high priority pending complaints",
      "What is the feedback rating of resolved complaints?",
      "Give me a total executive summary"
    ]
  }
}

/**
 * Priority Analysis Generator
 */
function generatePriorityAnalysis(dataset, stats) {
  const highPriority = dataset.filter((r) => (r.priority || '').toLowerCase().includes('high') || (r.priority || '').toLowerCase().includes('urgent'))
  const highPending = highPriority.filter((r) => r.status === 'Pending')

  let text = `🚨 **High & Urgent Priority Requests Analysis**

- **Total High Priority Requests**: **${highPriority.length}**
- **High Priority Still Pending**: **${highPending.length}** ⚠️
- **High Priority Closed**: **${highPriority.length - highPending.length}** ✅

`
  if (highPending.length > 0) {
    text += `⚠️ **Sample Urgent Pending Issues**:\n`
    highPending.slice(0, 3).forEach((item, idx) => {
      text += `${idx + 1}. **#${item.requestNumber}** | ${item.projectName} | ${item.requestType} (${item.ageInDays} days old)\n`
    })
  }

  return {
    text,
    matchingRecords: highPriority,
    actionTitle: `View All ${highPriority.length} High Priority Records`,
    suggestedQuestions: [
      "Which complaints are delayed more than 30 days?",
      "Show top problem categories",
      "Give me zone wise analysis"
    ]
  }
}

/**
 * 5. Zone Analysis Generator
 */
function generateZoneAnalysis(dataset, stats) {
  const topZones = getTopEntries(stats.zoneMap, 5)

  let text = `📍 **Zone Wise Maintenance Distribution**\n\n`
  topZones.forEach(([zone, count], idx) => {
    const zRecords = dataset.filter((r) => r.zoneName === zone)
    const pending = zRecords.filter((r) => r.status === 'Pending').length
    text += `**${idx + 1}. ${zone}**: **${count} Requests** (${pending} Pending)\n`
  })

  return {
    text,
    matchingRecords: dataset,
    actionTitle: `Explore Zone Comparison`,
    suggestedQuestions: [
      "Show project breakdown for top zone",
      "Which zone has most plumbing complaints?",
      "Give me executive summary"
    ]
  }
}

/**
 * 6. Category & Problem Type Analysis Generator
 */
function generateCategoryAnalysis(dataset, stats, query) {
  // Check if specific keyword matched
  const categories = getTopEntries(stats.categoryMap, 5)
  const types = getTopEntries(stats.typeMap, 5)

  // Filter specific category if query contains explicit term like "plumbing"
  let matchedKeyword = ''
  if (query.includes('plumbing')) matchedKeyword = 'Plumbing'
  else if (query.includes('electrical')) matchedKeyword = 'Electrical'
  else if (query.includes('seepage') || query.includes('leakage') || query.includes('water')) matchedKeyword = 'Water/Seepage'
  else if (query.includes('civil')) matchedKeyword = 'Civil'

  if (matchedKeyword) {
    const kwLower = matchedKeyword.toLowerCase()
    const specificRecords = dataset.filter((r) =>
      (r.requestGroup || '').toLowerCase().includes(kwLower) ||
      (r.requestType || '').toLowerCase().includes(kwLower) ||
      (r.description || '').toLowerCase().includes(kwLower)
    )

    const pending = specificRecords.filter((r) => r.status === 'Pending').length

    let text = `🔧 **${matchedKeyword} Specific Issues Analysis**

- **Total ${matchedKeyword} Complaints**: **${specificRecords.length}**
- **Pending Issues**: **${pending}** ⚠️
- **Resolved / Closed**: **${specificRecords.length - pending}** ✅

🏢 **Top Projects Affected by ${matchedKeyword}**:
`
    const projCount = {}
    specificRecords.forEach((r) => { projCount[r.projectName] = (projCount[r.projectName] || 0) + 1 })
    getTopEntries(projCount, 3).forEach(([p, c], i) => {
      text += `  ${i + 1}. **${p}**: ${c} complaints\n`
    })

    return {
      text,
      matchingRecords: specificRecords,
      actionTitle: `View All ${specificRecords.length} ${matchedKeyword} Records`,
      suggestedQuestions: [
        "Which project has the highest total issues?",
        "Show customer feedback stats",
        "Give me overall executive summary"
      ]
    }
  }

  // General Category breakdown
  let text = `🛠️ **Top Maintenance Categories & Problem Types**

📌 **Top Problem Groups (Categories)**:
${categories.map(([cat, count], i) => `  ${i + 1}. **${cat}**: ${count} complaints`).join('\n')}

🔍 **Top Specific Complaint Types**:
${types.map(([type, count], i) => `  ${i + 1}. **${type}**: ${count} complaints`).join('\n')}
`

  return {
    text,
    matchingRecords: dataset,
    actionTitle: "Explore Category Matrix Chart",
    suggestedQuestions: [
      "Show plumbing complaints",
      "Which problems take longest to resolve?",
      "Show pending requests status"
    ]
  }
}

/**
 * 7. Customer Feedback Analysis Generator
 */
function generateFeedbackAnalysis(dataset, stats) {
  let good = 0
  let bad = 0
  let average = 0
  let noFeedback = 0

  const goodComments = []
  const badComments = []

  dataset.forEach((item) => {
    const fb = String(item.feedbacks || item.feedbackComments || '').toLowerCase().trim()
    if (!fb || fb === '-' || fb === 'n/a' || fb === 'none' || fb === 'null') {
      noFeedback++
    } else if (
      fb.includes('good') || fb.includes('excellent') || fb.includes('satisfied') ||
      fb.includes('positive') || fb.includes('great') || fb.includes('happy') || fb.includes('5') || fb.includes('4')
    ) {
      good++
      if (goodComments.length < 2 && item.feedbackComments) goodComments.push(item.feedbackComments)
    } else if (
      fb.includes('bad') || fb.includes('poor') || fb.includes('unsatisfied') ||
      fb.includes('dissatisfied') || fb.includes('negative') || fb.includes('terrible') || fb.includes('1') || fb.includes('2')
    ) {
      bad++
      if (badComments.length < 2 && item.feedbackComments) badComments.push(item.feedbackComments)
    } else {
      average++
    }
  })

  let text = `👍 **Customer Feedback & Satisfaction Insights**

- **Good / Satisfied**: **${good}** (${Math.round((good / stats.total) * 100)}%) 😊
- **Average / Fair**: **${average}** (${Math.round((average / stats.total) * 100)}%) 😐
- **Bad / Unsatisfied**: **${bad}** (${Math.round((bad / stats.total) * 100)}%) 😡
- **No Feedback Recorded**: **${noFeedback}**

`
  if (badComments.length > 0) {
    text += `🔴 **Sample Negative Feedback Comments**:\n`
    badComments.forEach((c) => { text += `  - "${c}"\n` })
  }

  return {
    text,
    matchingRecords: dataset.filter((r) => r.feedbacks || r.feedbackComments),
    actionTitle: "View All Feedback Records",
    suggestedQuestions: [
      "What are the top pending issues?",
      "Show average resolution time",
      "Which project has most complaints?"
    ]
  }
}

/**
 * 8. People Analysis Generator
 */
function generatePeopleAnalysis(dataset, stats) {
  const requesters = {}
  dataset.forEach((r) => {
    if (r.raisedBy) requesters[r.raisedBy] = (requesters[r.raisedBy] || 0) + 1
  })

  const topRequesters = getTopEntries(requesters, 3)

  let text = `👤 **Requesters & People Insights**

👥 **Top Requesters (Highest Complaints Raised)**:
${topRequesters.map(([person, count], i) => `  ${i + 1}. **${person}**: ${count} requests raised`).join('\n')}

`

  return {
    text,
    matchingRecords: dataset,
    actionTitle: "View Records",
    suggestedQuestions: [
      "Give me an executive summary",
      "Show pending complaints",
      "What is the worst project?"
    ]
  }
}

/**
 * 9. Generic Search Generator
 */
function generateGenericSearch(dataset, stats, query) {
  const keywords = query.split(/\s+/).filter((k) => k.length > 2)

  const matched = dataset.filter((item) => {
    const searchString = [
      item.requestNumber,
      item.projectName,
      item.buildingName,
      item.unit,
      item.raisedBy,
      item.requestGroup,
      item.requestType,
      item.description,
      item.remark,
      item.zoneName,
      item.status
    ]
      .join(' ')
      .toLowerCase()

    return keywords.some((kw) => searchString.includes(kw))
  })

  if (matched.length === 0) {
    return {
      text: `🔍 **Search Results for "${query}"**

I couldn't find any direct records matching your search query in the current dataset view. 

Try asking one of the suggested prompts below or ask about **Pending issues**, **Top Projects**, **Plumbing/Electrical complaints**, or **Delays**!`,
      matchingRecords: [],
      suggestedQuestions: [
        "Give me an Executive Summary",
        "Which project has the most complaints?",
        "Show pending issues breakdown"
      ]
    }
  }

  const pendingInMatched = matched.filter((r) => r.status === 'Pending').length
  const closedInMatched = matched.filter((r) => r.status === 'Closed').length

  let text = `🔍 **Search Analysis for "${query}"**

- **Matching Records Found**: **${matched.length}** out of ${stats.total} total records
- **Pending**: **${pendingInMatched}** ⚠️
- **Closed / Resolved**: **${closedInMatched}** ✅

`
  if (matched.length > 0) {
    text += `📋 **Top Matching Sample Records**:\n`
    matched.slice(0, 3).forEach((item, idx) => {
      text += `${idx + 1}. **#${item.requestNumber}** | ${item.projectName || 'Project'} | ${item.requestGroup || 'General'} (${item.status})\n`
    })
  }

  return {
    text,
    matchingRecords: matched,
    actionTitle: `View All ${matched.length} Matched Records`,
    suggestedQuestions: [
      "Show high priority pending complaints",
      "What is the average resolution time?",
      "Give me executive summary"
    ]
  }
}

/**
 * 10. Quarter-Wise Performance Analytics Generator (3 Months per Quarter)
 */
function generateQuarterAnalysis(dataset, stats, query) {
  const quarterGroups = {
    Q1: { name: 'Q1 (Jan - Mar)', records: [], completed: 0, pending: 0 },
    Q2: { name: 'Q2 (Apr - Jun)', records: [], completed: 0, pending: 0 },
    Q3: { name: 'Q3 (Jul - Sep)', records: [], completed: 0, pending: 0 },
    Q4: { name: 'Q4 (Oct - Dec)', records: [], completed: 0, pending: 0 }
  }

  dataset.forEach((item) => {
    if (!item.raisedOnDate) return
    const m = item.raisedOnDate.getMonth()
    let qCode = 'Q1'
    if (m >= 3 && m <= 5) qCode = 'Q2'
    else if (m >= 6 && m <= 8) qCode = 'Q3'
    else if (m >= 9 && m <= 11) qCode = 'Q4'

    quarterGroups[qCode].records.push(item)
    const st = String(item.status || '').toLowerCase()
    if (st.includes('complete') || st.includes('close') || st.includes('resolve')) {
      quarterGroups[qCode].completed++
    } else if (!st.includes('cancel') && !st.includes('reject')) {
      quarterGroups[qCode].pending++
    }
  })

  // Check if specific quarter requested:
  let targetedQuarter = null
  if (query.includes('q1')) targetedQuarter = 'Q1'
  else if (query.includes('q2')) targetedQuarter = 'Q2'
  else if (query.includes('q3')) targetedQuarter = 'Q3'
  else if (query.includes('q4')) targetedQuarter = 'Q4'

  if (targetedQuarter) {
    const qData = quarterGroups[targetedQuarter]
    const total = qData.records.length
    const closure = total > 0 ? ((qData.completed / total) * 100).toFixed(1) : 0

    let text = `🗓️ **${qData.name} Deep-Dive Report**
    
- **Total Requests in ${targetedQuarter}**: **${total.toLocaleString()}**
- **Completed / Resolved**: **${qData.completed.toLocaleString()}** (${closure}%) ✅
- **Pending / In-Progress**: **${qData.pending.toLocaleString()}** ⚠️
- **Share of Workload**: **${total > 0 ? ((total / stats.total) * 100).toFixed(1) : 0}%**

💡 *Tip: Use the Quarter filter pills at the top to isolate this entire quarter on the dashboard!*`

    return {
      text,
      matchingRecords: qData.records,
      actionTitle: `View All ${total} Records for ${targetedQuarter}`,
      suggestedQuestions: [
        "Compare all 4 quarters",
        "Which project has the most complaints?",
        "Give me an executive summary"
      ]
    }
  }

  // Comparative report across all 4 quarters
  let text = `🗓️ **Quarter-Wise Maintenance Breakdown (3 Months per Quarter)**\n\n`
  Object.entries(quarterGroups).forEach(([qKey, qObj]) => {
    const count = qObj.records.length
    const closure = count > 0 ? ((qObj.completed / count) * 100).toFixed(1) : 0
    text += `🔹 **${qObj.name}**: **${count.toLocaleString()} requests** (${qObj.completed} Resolved, ${qObj.pending} Pending | Closure: **${closure}%**)\n`
  })

  const sortedQuarters = Object.entries(quarterGroups).sort((a, b) => b[1].records.length - a[1].records.length)
  const highestQ = sortedQuarters[0]

  if (highestQ && highestQ[1].records.length > 0) {
    text += `\n🚨 **Peak Activity Quarter**: **${highestQ[1].name}** had the highest complaint volume with **${highestQ[1].records.length.toLocaleString()} requests**.`
  }

  return {
    text,
    matchingRecords: highestQ ? highestQ[1].records : dataset,
    actionTitle: highestQ ? `View ${highestQ[1].name} Records (${highestQ[1].records.length})` : `View All Records`,
    suggestedQuestions: [
      "Show Q2 details",
      "Which complaints are delayed more than 15 days?",
      "Give me executive summary"
    ]
  }
}

