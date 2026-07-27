import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  History,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Trash2,
  Wand2
} from 'lucide-react';
import { databaseApi } from '../../api/client';

export default function AISuggestions({ projectId, onModifyComplete }) {
  const [history, setHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const [isReviewing, setIsReviewing] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [modifySuccess, setModifySuccess] = useState(null);
  const [loadingStep, setLoadingStep] = useState('Analyzing database structure...');
  const [reviewError, setReviewError] = useState(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const steps = [
    'Analyzing database structure...',
    'Checking relationships...',
    'Checking normalization...',
    'Checking data types...',
    'Generating suggestions...'
  ];

  useEffect(() => {
    if (projectId) {
      fetchReviewHistory();
    }
  }, [projectId]);

  const fetchReviewHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await databaseApi.getAiReviews(projectId);
      const reviews = res.reviews || [];
      setHistory(reviews);
      setSelectedIndex(0);
    } catch (err) {
      setHistoryError(err.message || 'Unable to load AI Review history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleReview = async () => {
    setIsReviewing(true);
    setReviewError(null);
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
      setShowHistoryPanel(false);
    } catch (err) {
      clearInterval(interval);
      setReviewError(err.message || 'New AI review failed. Your previous review has been preserved.');
    } finally {
      setIsReviewing(false);
    }
  };

  const activeReview = history[selectedIndex] || null;
  const isLatest = selectedIndex === 0;
  const previousReview = history.length > 1 && isLatest ? history[1] : null;

  const activeSuggestions = activeReview ? (activeReview.suggestions || []) : [];
  const activeSummary = activeReview ? activeReview.summary : '';
  const criticalCount = activeReview ? activeReview.criticalCount : 0;
  const warningCount = activeReview ? activeReview.warningCount : 0;
  const improvementCount = activeReview ? activeReview.improvementCount : 0;

  const handleModify = async () => {
    setIsModifying(true);
    setReviewError(null);
    setModifySuccess(null);

    try {
      const res = await databaseApi.modifyAi({
        projectId,
        suggestions: activeSuggestions
      });

      if (onModifyComplete) {
        await onModifyComplete();
      }

      setModifySuccess('Database design updated! ER Diagram, Entities, Relationships, Schema, SQL, and Validation have been modified based on AI suggestions.');

      await handleReview();
    } catch (err) {
      setReviewError(err.message || 'Failed to modify database design with AI suggestions.');
    } finally {
      setIsModifying(false);
    }
  };

  const handleDeleteReview = async (reviewId, targetIndex) => {
    if (!window.confirm('Are you sure you want to delete this AI review from history?')) {
      return;
    }

    setDeletingId(reviewId);
    try {
      if (reviewId) {
        await databaseApi.deleteAiReview(reviewId);
      }
      setHistory(prev => {
        const updated = prev.filter((_, idx) => idx !== targetIndex);
        if (updated.length === 0) {
          setSelectedIndex(0);
        } else if (selectedIndex >= updated.length) {
          setSelectedIndex(updated.length - 1);
        }
        return updated;
      });
    } catch (err) {
      alert(`Failed to delete AI Review: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to delete ALL AI Review history for this project?')) {
      return;
    }

    try {
      await databaseApi.clearAiReviews(projectId);
      setHistory([]);
      setSelectedIndex(0);
      setShowHistoryPanel(false);
    } catch (err) {
      alert(`Failed to clear AI Review history: ${err.message}`);
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
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner & Control Buttons */}
      <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-gray-900 border border-purple-800/40 rounded-xl p-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Database Review & Architecture Audit</h3>
            <p className="text-xs text-gray-400">Intelligent suggestions for index placement, 3NF normalization, and datatype optimization</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {history.length > 0 && (
            <button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className={`px-3.5 py-2 border rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                showHistoryPanel
                  ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Review History ({history.length})</span>
              {showHistoryPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleModify}
            disabled={isModifying || isReviewing || isLoadingHistory || activeSuggestions.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
            title="Modify and update Entities, Relationships, ER Diagram, Schema, and SQL based on AI suggestions"
          >
            <Wand2 className={`w-4 h-4 ${isModifying ? 'animate-spin' : ''}`} />
            <span>{isModifying ? 'Modifying...' : 'Modify'}</span>
          </button>

          <button
            onClick={handleReview}
            disabled={isReviewing || isModifying || isLoadingHistory}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <Cpu className={`w-4 h-4 ${isReviewing ? 'animate-spin' : ''}`} />
            <span>{isReviewing ? 'Reviewing...' : history.length > 0 ? 'Review Again' : 'Review With AI'}</span>
          </button>
        </div>
      </div>

      {/* Loading Review History State */}
      {isLoadingHistory && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h4 className="text-sm font-semibold text-white">Loading AI Review history...</h4>
        </div>
      )}

      {/* Loading Gemini Review State */}
      {!isLoadingHistory && isReviewing && (
        <div className="bg-[#111827] border border-purple-900/50 rounded-xl p-12 text-center space-y-4 shadow-xl">
          <div className="flex justify-center">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Reviewing your database design with AI...</h4>
            <p className="text-xs text-purple-400 font-mono mt-1.5 animate-pulse">{loadingStep}</p>
          </div>
        </div>
      )}

      {/* Loading Modify Design State */}
      {!isLoadingHistory && !isReviewing && isModifying && (
        <div className="bg-[#111827] border border-emerald-900/50 rounded-xl p-12 text-center space-y-4 shadow-xl">
          <div className="flex justify-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Modifying and updating database design with AI...</h4>
            <p className="text-xs text-emerald-400 font-mono mt-1.5 animate-pulse">Updating Entities, Relationships, ER Diagram, Schema & SQL...</p>
          </div>
        </div>
      )}

      {/* Modify Success Notification Banner */}
      {!isLoadingHistory && !isModifying && modifySuccess && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="font-bold text-emerald-300">{modifySuccess}</p>
          </div>
          <button
            onClick={() => setModifySuccess(null)}
            className="text-gray-400 hover:text-white text-xs font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* History Loading Error */}
      {!isLoadingHistory && historyError && (
        <div className="bg-[#111827] border border-red-800/60 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <div>
            <h4 className="text-base font-bold text-red-400">Unable to load AI Review history</h4>
            <p className="text-xs text-gray-400 font-mono mt-2 bg-[#0b0f17] p-2.5 rounded-lg max-w-lg mx-auto border border-gray-800/80 text-left">
              {historyError}
            </p>
          </div>
          <button
            onClick={fetchReviewHistory}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Non-destructive Gemini Review Error Banner */}
      {!isLoadingHistory && reviewError && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-400">Action failed. Your previous review has been preserved.</p>
              <p className="text-gray-300 text-[11px] font-mono mt-0.5">{reviewError}</p>
            </div>
          </div>
          <button
            onClick={handleReview}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition cursor-pointer shrink-0 shadow-md"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Review History Dropdown/Drawer Panel */}
      {!isLoadingHistory && showHistoryPanel && history.length > 0 && (
        <div className="bg-[#111827] border border-purple-800/50 rounded-xl p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Review History</h4>
              <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                {history.length} Saved Record{history.length > 1 ? 's' : ''}
              </span>
            </div>

            <button
              onClick={handleClearAllHistory}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2.5 py-1 rounded border border-red-800/40 flex items-center space-x-1 transition cursor-pointer font-mono"
              title="Delete all saved AI reviews for this project"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {history.map((rev, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={rev.id || idx}
                  className={`p-3.5 rounded-lg border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-600/80 text-white'
                      : 'bg-[#0b0f17] border-gray-800 hover:border-gray-700 text-gray-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-purple-300 font-mono">Review #{rev.reviewNumber}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono rounded">
                          LATEST
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 flex items-center space-x-1 font-mono">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{formatDate(rev.createdAt)}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-400">
                      <span>{rev.totalSuggestions || 0} Suggestions</span>
                      <span>•</span>
                      <span className="text-red-400">{rev.criticalCount || 0} Critical</span>
                      <span>•</span>
                      <span className="text-amber-400">{rev.warningCount || 0} Warnings</span>
                      <span>•</span>
                      <span className="text-indigo-400">{rev.improvementCount || 0} Improvements</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedIndex(idx);
                        setShowHistoryPanel(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white font-bold cursor-default'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                      }`}
                    >
                      {isSelected ? 'Viewing' : 'View Review'}
                    </button>

                    <button
                      onClick={() => handleDeleteReview(rev.id, idx)}
                      disabled={deletingId === rev.id}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition cursor-pointer border border-transparent hover:border-red-900/50"
                      title="Delete this review from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Initial Empty State (NO Reviews in database) */}
      {!isLoadingHistory && !isReviewing && !isModifying && !historyError && history.length === 0 && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center text-gray-400 space-y-3">
          <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-300">
            No AI database review has been generated yet.
          </p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Click <strong className="text-purple-400">Review With AI</strong> to analyze your database schema, relationships, indexes, and normalization.
          </p>
          <div className="pt-2">
            <button
              onClick={handleReview}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Review With AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Review Content View */}
      {!isLoadingHistory && !isReviewing && !isModifying && activeReview && (
        <div className="space-y-4">
          {/* Header Card for Active Review */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">AI Review Complete</h3>
                  <span className="px-2.5 py-0.5 bg-purple-950 text-purple-300 font-mono text-xs font-bold rounded border border-purple-800">
                    Review #{activeReview.reviewNumber}
                  </span>
                  {isLatest ? (
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold font-mono rounded border border-emerald-800 uppercase">
                      Latest
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-400 text-[10px] font-bold font-mono rounded border border-amber-800 uppercase">
                      Historical Review
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                  <span>Reviewed: <strong className="text-gray-200 font-mono">{formatDate(activeReview.createdAt)}</strong></span>
                  {!isLatest && (
                    <button
                      onClick={() => setSelectedIndex(0)}
                      className="text-purple-400 hover:text-purple-300 font-semibold underline flex items-center space-x-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back to Latest Review</span>
                    </button>
                  )}
                </div>

                {activeSummary && (
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    <strong className="text-white">Summary: </strong> {activeSummary}
                  </p>
                )}
              </div>

              {/* Counters Badge Row */}
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg font-bold border border-gray-700">
                  {activeSuggestions.length} Suggestions Found
                </span>
                <span className="px-2.5 py-1 bg-red-950/80 text-red-400 rounded-lg border border-red-800/80 font-semibold">
                  Critical: {criticalCount}
                </span>
                <span className="px-2.5 py-1 bg-amber-950/80 text-amber-400 rounded-lg border border-amber-800/80 font-semibold">
                  Warnings: {warningCount}
                </span>
                <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-400 rounded-lg border border-indigo-800/80 font-semibold">
                  Improvements: {improvementCount}
                </span>
              </div>
            </div>

            {/* Optional Comparison Badge with Previous Review */}
            {previousReview && (
              <div className="bg-[#0b0f17] border border-gray-800/80 rounded-lg p-3 flex items-center justify-between text-xs font-mono text-gray-300 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Comparison with Review #{previousReview.reviewNumber}:</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>
                    Suggestions: <span className="text-gray-400">{previousReview.totalSuggestions || 0}</span> → <strong className="text-white">{activeReview.totalSuggestions || 0}</strong>
                  </span>
                  <span>
                    Critical: <span className="text-red-400">{previousReview.criticalCount || 0}</span> → <strong className="text-white">{activeReview.criticalCount || 0}</strong>
                  </span>
                  <span>
                    Warnings: <span className="text-amber-400">{previousReview.warningCount || 0}</span> → <strong className="text-white">{activeReview.warningCount || 0}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Result State: Complete with NO Suggestions */}
          {activeSuggestions.length === 0 && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">No Issues Identified</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Your current database design looks well structured according to this review.</p>
                </div>
              </div>
            </div>
          )}

          {/* Suggestion Cards */}
          {activeSuggestions.length > 0 && (
            <div className="space-y-4">
              {activeSuggestions.map((item, idx) => (
                <div key={idx} className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        item.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                        item.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-indigo-950 text-indigo-400 border border-indigo-800'
                      }`}>
                        {item.severity}
                      </span>
                      <span className="font-semibold text-white text-sm">{item.title}</span>
                      {item.category && (
                        <span className="text-xs text-gray-400 font-mono">[{item.category}]</span>
                      )}
                    </div>
                  </div>

                  {/* Table & Column metadata */}
                  {(item.table || item.column) && (
                    <div className="flex items-center space-x-4 text-xs font-mono bg-[#0b0f17] px-3 py-1.5 rounded-lg border border-gray-800/80">
                      {item.table && (
                        <div>
                          <span className="text-gray-500">Table:</span> <span className="text-indigo-300 font-bold">{item.table}</span>
                        </div>
                      )}
                      {item.column && (
                        <div>
                          <span className="text-gray-500">Column:</span> <span className="text-purple-300 font-bold">{item.column}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* AI Suggestion */}
                  {item.suggestion && (
                    <div className="p-3 bg-[#0b0f17] border border-indigo-900/40 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">AI Suggestion:</span>
                      <p className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{item.suggestion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
