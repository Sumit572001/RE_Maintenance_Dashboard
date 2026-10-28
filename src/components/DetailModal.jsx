import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, MapPin, Clock, AlertTriangle, FileText, CheckCircle, MessageSquare, Tag } from 'lucide-react'

export function DetailModal({ record, onClose }) {
  if (!record) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  {record.requestNumber}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${record.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                  {record.status}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 rounded-md">
                  Priority: {record.priority}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {record.requestGroup} — <span className="text-slate-500 font-normal">{record.requestType}</span>
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
            {/* Section 1: Basic Info & Description */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-medium">Request Number:</span>
                  <p className="text-slate-900 font-mono font-bold mt-0.5">{record.requestNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Request For:</span>
                  <p className="text-slate-900 mt-0.5">{record.requestFor || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium">Description:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap">
                    {record.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Raised By & Assigned To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Raised By Box */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" /> Raised By Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500">Name:</span>{' '}
                    <span className="text-slate-900 font-semibold">{record.raisedBy || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>{' '}
                    <span className="text-slate-800 font-mono">{record.raisedByEmail || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Role:</span>{' '}
                    <span className="text-slate-800">{record.raisedByRole || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Raised On:</span>{' '}
                    <span className="text-slate-800 font-mono">{record.raisedOn || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Assignment Box */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" /> Assignment & Updates
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500">Assigned To:</span>{' '}
                    <span className="text-slate-900 font-semibold">{record.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Assigned Email:</span>{' '}
                    <span className="text-slate-800 font-mono">{record.assignedToEmail || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Updated By:</span>{' '}
                    <span className="text-slate-800">{record.updatedBy || '-'} ({record.updatedByRole || ''})</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Updated On:</span>{' '}
                    <span className="text-slate-800 font-mono">{record.updateOn || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Location Details */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500">Zone:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{record.zoneName || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Project:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{record.projectName || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Building:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{record.buildingName || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Unit:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{record.unit || '-'}</p>
                </div>
              </div>
            </div>

            {/* Section 4: Timing & Delays */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Timing & Turnaround Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500">TAT (Turnaround Time):</span>
                  <p className="text-amber-700 font-mono font-bold text-sm mt-0.5">{record.tatDays ?? record.ageInDays} days</p>
                </div>
                <div>
                  <span className="text-slate-500">Age in Days:</span>
                  <p className="text-slate-900 font-mono font-bold text-sm mt-0.5">{record.ageInDays} days</p>
                </div>
                <div>
                  <span className="text-slate-500">Raised On:</span>
                  <p className="text-slate-900 font-mono font-semibold text-xs mt-0.5">{record.raisedOn || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Actual Completion:</span>
                  <p className="text-slate-900 font-mono font-semibold text-xs mt-0.5">{record.completionDate || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Delay Days:</span>
                  <p className="text-slate-800 font-mono text-xs mt-0.5">{record.delayDays} days</p>
                </div>
                <div>
                  <span className="text-slate-500">Nearing Days:</span>
                  <p className="text-slate-800 font-mono text-xs mt-0.5">{record.nearingDays} days</p>
                </div>
                <div>
                  <span className="text-slate-500">Quarter (3 Months):</span>
                  <p className="text-blue-600 font-bold text-xs mt-0.5">{record.quarterLabel || record.quarterCalendar || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Preferred Visit Date:</span>
                  <p className="text-slate-800 text-xs mt-0.5">{record.preferedVisitDate || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Expected Completion:</span>
                  <p className="text-slate-800 text-xs mt-0.5">{record.expectedCompletionDate || '-'}</p>
                </div>
              </div>
            </div>

            {/* Section 5: Escalations & Remarks */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Escalation & Remarks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div>
                  <span className="text-slate-500">Escalation Level:</span>
                  <p className="text-rose-600 font-bold mt-0.5">{record.escalationLevel || 'None'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Escalated To:</span>
                  <p className="text-slate-800 mt-0.5">{record.escalatedTo || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Escalation Reason:</span>
                  <p className="text-slate-800 mt-0.5">{record.reasonForEscalation || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500">Remark:</span>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">{record.remark || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Completion Remark:</span>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">{record.completionRemark || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">On Hold Message:</span>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">{record.onHoldMessage || '-'}</p>
                </div>
              </div>
            </div>

            {/* Section 6: Feedbacks, Notes & Messages */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Feedback, Notes & Messages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Feedbacks:</span>
                  <p className="text-slate-800 mt-0.5">{record.feedbacks || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Feedback Comments:</span>
                  <p className="text-slate-800 mt-0.5">{record.feedbackComments || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Note:</span>
                  <p className="text-slate-800 mt-0.5">{record.note || '-'} {record.noteCreatedBy ? `(By ${record.noteCreatedBy})` : ''}</p>
                </div>
                <div>
                  <span className="text-slate-500">Posted Message:</span>
                  <p className="text-slate-800 mt-0.5">{record.message || '-'} {record.messagePostedBy ? `(By ${record.messagePostedBy})` : ''}</p>
                </div>
              </div>
            </div>

            {/* Section 7: Custom Fields & Rules */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-500" /> Additional Attributes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Rule Applied:</span>
                  <p className="text-slate-800 mt-0.5">{record.rule || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Custom Fields:</span>
                  <p className="text-slate-800 font-mono mt-0.5">{record.customFields || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
