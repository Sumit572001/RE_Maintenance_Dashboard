import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, X, Send, Trash2, ArrowRight, Filter, Database, Check, Copy } from 'lucide-react'
import { analyzeQuery } from '../services/aiAgentEngine'

const INITIAL_PROMPTS = [
  "📊 Executive Summary",
  "⚠️ High Priority Pending Issues",
  "🏢 Top Projects with Most Complaints",
  "⏱️ Average Resolution Time & Aging",
  "🔧 Plumbing & Water Leakage Issues",
  "👍 Customer Feedback Ratings"
]

export function AIAssistantDrawer({
  isOpen,
  onClose,
  onOpen,
  filteredData = [],
  rawData = [],
  onOpenDrillDown
}) {
  // Chat Scope: 'filtered' (active filters) vs 'all' (entire dataset)
  const [dataScope, setDataScope] = useState('filtered')
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const messagesEndRef = useRef(null)

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `👋 **Hello! I am your AI Maintenance Data Assistant.**\n\nI can analyze all your maintenance records, top problem categories, pending complaints, aging delays, project metrics, and customer feedback in real-time!\n\nAsk me anything or select a prompt below to get started.`,
      matchingRecords: [],
      actionTitle: null,
      suggestedQuestions: INITIAL_PROMPTS
    }
  ])

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = (queryToSend) => {
    const text = (queryToSend || inputQuery).trim()
    if (!text) return

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text
    }

    setMessages((prev) => [...prev, userMsg])
    if (!queryToSend) setInputQuery('')
    setIsTyping(true)

    // Select active dataset based on scope toggle
    const activeDataset = dataScope === 'filtered' ? filteredData : rawData

    // Simulate smart quick processing
    setTimeout(() => {
      const botResponse = analyzeQuery(text, activeDataset, rawData)

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse.text,
        matchingRecords: botResponse.matchingRecords || [],
        actionTitle: botResponse.actionTitle || null,
        suggestedQuestions: botResponse.suggestedQuestions || []
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 400)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'bot',
        text: `👋 Chat cleared! Ask me any question about your dashboard data.`,
        matchingRecords: [],
        actionTitle: null,
        suggestedQuestions: INITIAL_PROMPTS
      }
    ])
  }

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <>
      {/* Floating Glowing Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-blue-500/25 border border-white/20 backdrop-blur-lg group transition-all duration-300"
          title="Open AI Data Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-bold text-sm tracking-wide">Ask AI Agent</span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        </motion.button>
      )}

      {/* Slide-Over Drawer Modal Backdrop & Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            />

            {/* Slide Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md md:max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 border-l border-slate-200"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base text-white tracking-wide">AI Maintenance Assistant</h2>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Data Analytics & Natural Language Query</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearChat}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Clear Chat History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Close Assistant"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Data Scope Toggle Bar */}
              <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  Active Dataset Scope:
                </span>
                <div className="flex bg-white p-0.5 rounded-lg border border-slate-300 shadow-inner">
                  <button
                    onClick={() => setDataScope('filtered')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      dataScope === 'filtered'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Filtered View ({filteredData.length})
                  </button>
                  <button
                    onClick={() => setDataScope('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      dataScope === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Dataset ({rawData.length})
                  </button>
                </div>
              </div>

              {/* Message Transcript Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm relative group ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-slate-100'
                      }`}
                    >
                      {/* Message Copy Button */}
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleCopyText(msg.text, idx)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 rounded"
                          title="Copy Answer"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Content Markdown Formatted */}
                      <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                        {renderFormattedMarkdown(msg.text)}
                      </div>

                      {/* Interactive Action Button for Records */}
                      {msg.matchingRecords && msg.matchingRecords.length > 0 && msg.actionTitle && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              onOpenDrillDown(msg.actionTitle, msg.matchingRecords)
                            }}
                            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
                          >
                            <span>{msg.actionTitle}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Suggested Question Pills (if available) */}
                    {msg.sender === 'bot' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[92%]">
                        {msg.suggestedQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSend(q)}
                            className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium px-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-300 transition-all shadow-2xs"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-slate-400 text-xs bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-xs"
                  >
                    <Bot className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>Analyzing dataset metrics...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask anything about dashboard data..."
                    className="flex-1 bg-slate-100 border border-slate-300 focus:border-blue-500 focus:bg-white text-slate-800 text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-md transition-all flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Format markdown bold text (**bold**) into React elements for clean rendering
 */
function renderFormattedMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')

  return lines.map((line, lIdx) => {
    // Replace **bold** tags
    const parts = line.split(/(\*\*.*?\*\*)/g)
    const formattedLine = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
      }
      return part
    })

    return (
      <React.Fragment key={lIdx}>
        {formattedLine}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    )
  })
}
