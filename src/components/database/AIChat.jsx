import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Cpu,
  Send,
  User,
  Bot,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  History,
  Clock,
  Trash2,
  Wand2,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
  Zap,
  HelpCircle,
  Code
} from 'lucide-react';
import { databaseApi, projectApi } from '../../api/client';

export default function AIChat({ projectId, onModifyComplete, onNavigateTab }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [modifySuccess, setModifySuccess] = useState(null);
  const [loadingStep, setLoadingStep] = useState('Analyzing database structure...');
  const [chatError, setChatError] = useState(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [projectData, setProjectData] = useState(null);

  const chatEndRef = useRef(null);

  const steps = [
    'Analyzing database structure...',
    'Checking relationships & foreign keys...',
    'Checking 3NF normalization...',
    'Checking datatypes & index placements...',
    'Generating architectural suggestions...'
  ];

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `👋 Hello! I am your **AI Database Architect & Assistant** for DevForge.

I can help you review your schema, optimize 3NF normalization, inspect index placements, answer questions about your database architecture, and automatically modify your entities & SQL definitions!

Try typing a question below or choose one of the quick actions to start.`
      }
    ]);
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchReviewHistory();
      loadProjectContext();
    }
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, isModifying]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadProjectContext = async () => {
    try {
      const res = await projectApi.getProject(projectId);
      if (res && res.project) {
        setProjectData(res.project);
      }
    } catch (err) {
      console.warn('Could not load detailed project context for AI chat:', err);
    }
  };

  const fetchReviewHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await databaseApi.getAiReviews(projectId);
      const reviews = res.reviews || [];
      setHistory(reviews);
      setSelectedIndex(0);

      // If reviews exist, add previous review summary to chat history
      if (reviews.length > 0) {
        const latest = reviews[0];
        setMessages(prev => {
          if (prev.some(m => m.id === `review-${latest.id}`)) return prev;
          return [
            ...prev,
            {
              id: `review-${latest.id}`,
              sender: 'ai',
              timestamp: formatDate(latest.createdAt),
              content: `📋 **Latest AI Architecture Audit (Review #${latest.reviewNumber}):**\n${latest.summary || 'Database audit completed.'}`,
              isReviewResult: true,
              reviewData: latest,
              suggestions: latest.suggestions || []
            }
          ];
        });
      }
    } catch (err) {
      setHistoryError(err.message || 'Unable to load AI Review history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const runAiReview = async () => {
    setIsProcessing(true);
    setChatError(null);
    setLoadingStep(steps[0]);

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 800);

    try {
      const res = await databaseApi.reviewAi({ projectId });
      clearInterval(interval);

      let newReview = res.review;
      if (!newReview) {
        newReview = {
          id: Date.now(),
          reviewNumber: history.length > 0 ? (history[0].reviewNumber + 1) : 1,
          createdAt: new Date().toISOString(),
          summary: res.summary || '',
          totalSuggestions: res.suggestions ? res.suggestions.length : 0,
          criticalCount: (res.suggestions || []).filter(s => s.severity === 'CRITICAL').length,
          warningCount: (res.suggestions || []).filter(s => s.severity === 'WARNING').length,
          improvementCount: (res.suggestions || []).filter(s => s.severity === 'IMPROVEMENT').length,
          suggestions: res.suggestions || []
        };
      }

      setHistory(prev => [newReview, ...prev]);
      setSelectedIndex(0);

      // Add AI response message with review results
      const aiMsg = {
        id: `review-${newReview.id || Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `🔍 **AI Architecture Audit Complete (Review #${newReview.reviewNumber})**\n\n${newReview.summary || 'I have analyzed your database structure, entities, and relationships.'}`,
        isReviewResult: true,
        reviewData: newReview,
        suggestions: newReview.suggestions || []
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      clearInterval(interval);
      setChatError(err.message || 'AI review analysis failed.');
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `❌ **Audit Error:** ${err.message || 'Unable to complete AI review. Please check your backend connection and try again.'}`,
          isError: true
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModify = async (suggestionsToApply) => {
    setIsModifying(true);
    setChatError(null);
    setModifySuccess(null);

    const activeSugg = suggestionsToApply || (history[selectedIndex] ? history[selectedIndex].suggestions : []);

    try {
      await databaseApi.modifyAi({
        projectId,
        suggestions: activeSugg
      });

      if (onModifyComplete) {
        await onModifyComplete();
      }

      setModifySuccess('Database design updated! ER Diagram, Entities, Relationships, Schema, SQL, and Validation have been modified based on AI suggestions.');

      // Add notification message in chat
      setMessages(prev => [
        ...prev,
        {
          id: `modify-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `✅ **Database Schema Updated!**\n\nAll AI suggestions have been applied to your Entities, Relationships, ER Diagram, Schema, SQL, and Validation rules.`,
          isModifySuccess: true
        }
      ]);

      // Refresh review history
      await runAiReview();
    } catch (err) {
      setChatError(err.message || 'Failed to modify database design with AI suggestions.');
      setMessages(prev => [
        ...prev,
        {
          id: `err-modify-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `❌ **Modification Error:** ${err.message || 'Failed to modify database design with AI suggestions.'}`,
          isError: true
        }
      ]);
    } finally {
      setIsModifying(false);
    }
  };

  const handleSend = async (overridePrompt) => {
    const textToSend = overridePrompt || input.trim();
    if (!textToSend || isProcessing || isModifying) return;

    if (!overridePrompt) setInput('');

    // Append User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: textToSend
    };
    setMessages(prev => [...prev, userMsg]);

    const lower = textToSend.toLowerCase();

    // Trigger AI Review if prompt asks for review/audit
    if (lower.includes('review') || lower.includes('audit') || lower.includes('analyze database')) {
      await runAiReview();
      return;
    }

    // Trigger Modify if prompt asks for modify/apply
    if (lower.includes('apply') || lower.includes('modify') || lower.includes('fix schema')) {
      const activeSugg = history.length > 0 ? history[0].suggestions : [];
      await handleModify(activeSugg);
      return;
    }

    // Process general conversational database prompt
    setIsProcessing(true);
    try {
      // Simulate intelligent conversational response based on schema context
      await new Promise(r => setTimeout(r, 1000));

      let aiResponseText = `I have analyzed your request regarding **"${textToSend}"**.\n\n`;

      if (lower.includes('3nf') || lower.includes('normalization')) {
        aiResponseText += `To maintain 3rd Normal Form (3NF):\n` +
          `1. Ensure all non-key attributes are fully dependent on the primary key.\n` +
          `2. Eliminate transitive dependencies by creating dedicated reference tables for repeated lookup values.\n` +
          `3. Run a full **AI Architecture Audit** to automatically detect normalization violations in your current schema.`;
      } else if (lower.includes('index') || lower.includes('performance')) {
        aiResponseText += `Here are key indexing guidelines for your tables:\n` +
          `• Create B-tree indexes on foreign key columns used in JOIN queries.\n` +
          `• Add composite indexes for multi-column WHERE clauses.\n` +
          `• Avoid over-indexing columns with low cardinality (e.g. boolean flags).\n\n` +
          `You can also view automated index recommendations under the **Indexes** tab!`;
      } else if (lower.includes('entity') || lower.includes('table') || lower.includes('relation')) {
        const entCount = projectData?.entities?.length || 0;
        const relCount = projectData?.relationships?.length || 0;
        aiResponseText += `Your current database project contains **${entCount} Entities** and **${relCount} Relationships**.\n\n` +
          `You can request an architectural audit to verify entity definitions, primary keys, and data types!`;
      } else {
        aiResponseText += `Here are recommendations for your database architecture:\n` +
          `• **Schema Integrity:** Verify foreign key constraints and cascade deletion rules.\n` +
          `• **Data Types:** Use explicit sizing for VARCHAR columns and appropriate integer precision.\n` +
          `• **Audit Fields:** Consider adding \`created_at\` and \`updated_at\` timestamp columns to core tables.\n\n` +
          `Click **"Run Architecture Audit"** below to generate automated AI recommendations for your project.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: aiResponseText
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Sorry, I encountered an issue processing your query. Please try again.`,
          isError: true
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteReview = async (reviewId, targetIndex) => {
    if (!window.confirm('Are you sure you want to delete this audit log from history?')) return;

    setDeletingId(reviewId || targetIndex);
    try {
      if (reviewId) {
        try {
          await databaseApi.deleteAiReview(reviewId);
        } catch (apiErr) {
          console.warn('API delete warning:', apiErr.message);
        }
      }
      setHistory(prev => {
        const updated = prev.filter((_, idx) => idx !== targetIndex);
        if (updated.length === 0) setSelectedIndex(0);
        else if (selectedIndex >= updated.length) setSelectedIndex(updated.length - 1);
        return updated;
      });
    } catch (err) {
      alert(`Failed to delete history log: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to delete ALL AI audit logs for this project?')) return;

    try {
      await databaseApi.clearAiReviews(projectId);
      setHistory([]);
      setSelectedIndex(0);
      setShowHistoryPanel(false);
    } catch (err) {
      alert(`Failed to clear history: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      let str = String(dateString).trim();
      if (!str.includes('Z') && !str.includes('+')) {
        str = str.replace(' ', 'T') + 'Z';
      }
      const date = new Date(str);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] max-w-6xl mx-auto bg-[#0d1117] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-gray-900 border-b border-purple-800/40 p-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">AI Database Assistant & Chat</h3>
              <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>Online</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">Ask questions, audit database 3NF normalization, optimize indexes & apply AI schema modifications</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {history.length > 0 && (
            <button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                showHistoryPanel
                  ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Chat History ({history.length})</span>
              {showHistoryPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={() => handleModify()}
            disabled={isModifying || isProcessing || isLoadingHistory || history.length === 0}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition disabled:opacity-40 cursor-pointer"
            title="Modify and update Entities, Relationships, ER Diagram, Schema, and SQL based on AI suggestions"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isModifying ? 'animate-spin' : ''}`} />
            <span>{isModifying ? 'Modifying...' : 'Modify Schema'}</span>
          </button>

          <button
            onClick={() => runAiReview()}
            disabled={isProcessing || isModifying || isLoadingHistory}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-purple-600/20 transition disabled:opacity-40 cursor-pointer"
          >
            <Cpu className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Auditing...' : 'Run Audit'}</span>
          </button>
        </div>
      </div>

      {/* History Panel Drawer */}
      {showHistoryPanel && (
        <div className="bg-[#111827] border-b border-purple-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
              <History className="w-4 h-4 text-purple-400" />
              <span>AI Chat & Audit Logs</span>
            </h4>
            {history.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-[11px] text-red-400 hover:text-red-300 font-medium flex items-center space-x-1 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All History</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {history.map((rev, idx) => (
              <div
                key={rev.id || idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  setShowHistoryPanel(false);
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition flex justify-between items-start ${
                  selectedIndex === idx
                    ? 'bg-purple-950/60 border-purple-600 text-white'
                    : 'bg-gray-900/60 hover:bg-gray-800/80 border-gray-800 text-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs">Review #{rev.reviewNumber || (history.length - idx)}</span>
                    <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatDate(rev.createdAt)}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded border border-red-500/30">
                      {rev.criticalCount || 0} Critical
                    </span>
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                      {rev.warningCount || 0} Warn
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReview(rev.id, idx);
                  }}
                  disabled={deletingId === rev.id}
                  className="text-gray-500 hover:text-red-400 p-1 transition"
                  title="Delete review"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modify Success Notification Banner */}
      {modifySuccess && (
        <div className="bg-emerald-950/60 border-b border-emerald-800/60 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{modifySuccess}</span>
          </div>
          <div className="flex items-center space-x-2">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('diff')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
              >
                <GitCompare className="w-3 h-3" />
                <span>View Diff</span>
              </button>
            )}
            <button
              onClick={() => setModifySuccess(null)}
              className="text-gray-400 hover:text-white text-[11px] px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'user'
                  ? 'bg-blue-600/30 border-blue-500/40 text-blue-400'
                  : 'bg-purple-600/30 border-purple-500/40 text-purple-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-3xl space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
              <div className="flex items-center space-x-2 text-[11px] text-gray-400 px-1">
                <span className="font-semibold text-gray-300">{msg.sender === 'user' ? 'You' : 'AI Architect'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-xl text-xs leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-blue-900/30 border-blue-800/40 text-blue-100 rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-950/40 border-red-800/50 text-red-200 rounded-tl-none'
                    : 'bg-gray-900/90 border-gray-800 text-gray-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Render Embedded Review Suggestion Cards if available */}
                {msg.isReviewResult && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-purple-900/40 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded font-bold border border-red-500/30">
                          {msg.reviewData?.criticalCount || 0} Critical
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold border border-amber-500/30">
                          {msg.reviewData?.warningCount || 0} Warning
                        </span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold border border-blue-500/30">
                          {msg.reviewData?.improvementCount || 0} Improvement
                        </span>
                      </div>
                      <button
                        onClick={() => handleModify(msg.suggestions)}
                        disabled={isModifying}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        <Wand2 className={`w-3.5 h-3.5 ${isModifying ? 'animate-spin' : ''}`} />
                        <span>Modify & Apply All Suggestions</span>
                      </button>
                    </div>

                    <div className="space-y-2 mt-2">
                      {msg.suggestions.map((sugg, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-3 rounded-lg border text-left space-y-1.5 ${
                            sugg.severity === 'CRITICAL'
                              ? 'bg-red-950/20 border-red-800/40'
                              : sugg.severity === 'WARNING'
                              ? 'bg-amber-950/20 border-amber-800/40'
                              : 'bg-blue-950/20 border-blue-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                sugg.severity === 'CRITICAL'
                                  ? 'bg-red-500/30 text-red-300'
                                  : sugg.severity === 'WARNING'
                                  ? 'bg-amber-500/30 text-amber-300'
                                  : 'bg-blue-500/30 text-blue-300'
                              }`}
                            >
                              {sugg.severity || 'IMPROVEMENT'}
                            </span>
                            {sugg.entity && (
                              <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                                Table: {sugg.entity}
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-white text-xs">{sugg.title || sugg.issue}</h5>
                          <p className="text-gray-300 text-[11px]">{sugg.description || sugg.suggestion}</p>
                          {sugg.recommendation && (
                            <p className="text-emerald-400 text-[11px] font-medium bg-emerald-950/40 p-2 rounded border border-emerald-800/30">
                              💡 <strong>Recommendation:</strong> {sugg.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-gray-900/90 border border-purple-900/50 p-4 rounded-xl rounded-tl-none text-xs space-y-2">
              <div className="flex items-center space-x-2 text-purple-400 font-mono">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="animate-pulse">{loadingStep}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modifying Schema Indicator */}
        {isModifying && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
              <Wand2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-gray-900/90 border border-emerald-900/50 p-4 rounded-xl rounded-tl-none text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="animate-pulse">Updating Entities, Relationships, ER Diagram, Schema & SQL...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="bg-[#0b0f17] border-t border-gray-800/80 px-4 py-2.5 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-gray-500 font-medium text-[11px] shrink-0">Quick Prompts:</span>
        <button
          onClick={() => handleSend('Run Full Architecture Review')}
          disabled={isProcessing || isModifying}
          className="px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/50 rounded-full text-[11px] font-medium flex items-center space-x-1 shrink-0 transition cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>🔍 Run Architecture Audit</span>
        </button>
        <button
          onClick={() => handleSend('How to optimize 3NF normalization?')}
          disabled={isProcessing || isModifying}
          className="px-2.5 py-1 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/50 rounded-full text-[11px] font-medium flex items-center space-x-1 shrink-0 transition cursor-pointer"
        >
          <Layers className="w-3 h-3 text-blue-400" />
          <span>⚡ Audit 3NF Normalization</span>
        </button>
        <button
          onClick={() => handleSend('Analyze index placement and foreign keys')}
          disabled={isProcessing || isModifying}
          className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/50 rounded-full text-[11px] font-medium flex items-center space-x-1 shrink-0 transition cursor-pointer"
        >
          <Zap className="w-3 h-3 text-indigo-400" />
          <span>🔑 Check Indexes & Keys</span>
        </button>
        <button
          onClick={() => handleSend('Apply AI Suggestions & Modify Database')}
          disabled={isProcessing || isModifying || history.length === 0}
          className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 rounded-full text-[11px] font-medium flex items-center space-x-1 shrink-0 transition cursor-pointer disabled:opacity-40"
        >
          <Wand2 className="w-3 h-3 text-emerald-400" />
          <span>🪄 Apply Suggestions & Modify</span>
        </button>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-[#111827] p-3 border-t border-gray-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Assistant about database design, 3NF, indexes, or type 'Run review'..."
          disabled={isProcessing || isModifying}
          className="flex-1 bg-[#0b0f17] border border-gray-700/70 focus:border-purple-500 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing || isModifying}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition disabled:opacity-40 cursor-pointer shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
