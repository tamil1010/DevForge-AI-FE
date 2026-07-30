import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Database,
  Layers,
  Table as TableIcon,
  ShieldCheck,
  Code,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { databaseApi } from '../../api/client';

export default function IndexRecommendations({
  projectId,
  schema,
  isOutdated: propOutdated = false,
  onApplyIndex: propOnApplyIndex
}) {
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Data States
  const [recommendations, setRecommendations] = useState([]);
  const [existingIndexes, setExistingIndexes] = useState([]);
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [summary, setSummary] = useState({
    totalTables: 0,
    existingIndexes: 0,
    recommendedIndexes: 0,
    performanceScore: 92,
    scoreLabel: 'Excellent',
    breakdown: { pk: 100, fk: 85, search: 75, composite: 80 }
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isOutdated, setIsOutdated] = useState(propOutdated);

  // Applied & Ignored sets
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [ignoredIds, setIgnoredIds] = useState(new Set());

  // Filter & Search & Sort states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending', 'Applied', 'Ignored'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'table', 'benefit'

  useEffect(() => {
    if (projectId) {
      loadIndexData();
    } else if (schema) {
      // Local fallback analysis if no backend connection
      runLocalAnalysis();
    }
  }, [projectId, schema]);

  const loadIndexData = async () => {
    setLoading(true);
    try {
      const res = await databaseApi.getIndexRecommendations(projectId);
      if (res.success) {
        setRecommendations(res.recommendations || []);
        setExistingIndexes(res.existingIndexes || []);
        setAllRecommendations(res.allRecommendations || []);
        if (res.summary) setSummary(res.summary);
        if (res.aiAnalysis) setAiAnalysis(res.aiAnalysis);
        setIsOutdated(Boolean(res.isOutdated));

        // Reconstruct applied & ignored sets from item statuses
        const applied = new Set();
        const ignored = new Set();
        (res.allRecommendations || []).forEach((item) => {
          if (item.status === 'Applied') applied.add(item.id);
          if (item.status === 'Ignored') ignored.add(item.id);
        });
        setAppliedIds(applied);
        setIgnoredIds(ignored);
      }
    } catch (err) {
      console.warn('Backend index recommendation fetch fallback:', err.message);
      runLocalAnalysis();
    } finally {
      setLoading(false);
    }
  };

  const runLocalAnalysis = () => {
    if (!schema || !schema.tables) return;
    const recs = [];
    const existing = [];
    let totalTables = schema.tables.length;

    schema.tables.forEach((t) => {
      (t.columns || []).forEach((c) => {
        if (c.isPrimaryKey) {
          existing.push({
            id: `pk_${t.name}_${c.name}`,
            table: t.name,
            column: c.name,
            category: 'Primary Key',
            indexType: 'PRIMARY KEY Index',
            priority: 'HIGH',
            estimatedBenefit: 'High',
            reason: 'Automatically created for primary key constraint and O(1) B-Tree row lookup.',
            sql: `PRIMARY KEY (${c.name})`,
            status: 'Already Indexed',
            isExisting: true
          });
        } else if (c.isForeignKey) {
          recs.push({
            id: `fk_${t.name}_${c.name}`,
            table: t.name,
            column: c.name,
            category: 'Foreign Key',
            indexType: 'B-Tree Foreign Key Index',
            priority: 'HIGH',
            estimatedBenefit: 'High',
            reason: `Frequently used JOIN column. Accelerates JOIN query performance and cascade deletes.`,
            sql: `CREATE INDEX idx_${t.name.toLowerCase()}_${c.name.toLowerCase()} ON ${t.name}(${c.name});`,
            status: 'Recommended',
            isExisting: false
          });
        }
      });
    });

    setRecommendations(recs);
    setExistingIndexes(existing);
    setAllRecommendations([...existing, ...recs]);
    setSummary({
      totalTables,
      existingIndexes: existing.length,
      recommendedIndexes: recs.length,
      performanceScore: recs.length === 0 ? 98 : 88,
      scoreLabel: recs.length === 0 ? 'Excellent' : 'Good',
      breakdown: { pk: 100, fk: 80, search: 75, composite: 70 }
    });
  };

  const handleApplyIndex = async (item) => {
    const nextApplied = new Set(appliedIds);
    nextApplied.add(item.id);
    setAppliedIds(nextApplied);

    const nextIgnored = new Set(ignoredIds);
    nextIgnored.delete(item.id);
    setIgnoredIds(nextIgnored);

    if (propOnApplyIndex) propOnApplyIndex(item);

    if (projectId) {
      try {
        const res = await databaseApi.saveIndexState({
          projectId,
          appliedIndexes: Array.from(nextApplied),
          ignoredIndexes: Array.from(nextIgnored)
        });
        if (res.success) {
          setSummary(res.summary);
          setRecommendations(res.recommendations || []);
          setAllRecommendations(res.allRecommendations || []);
        }
      } catch (err) {
        console.error('Failed to save index state:', err.message);
      }
    } else {
      updateLocalSummary(nextApplied, nextIgnored);
    }
  };

  const handleIgnoreIndex = async (item) => {
    const nextIgnored = new Set(ignoredIds);
    nextIgnored.add(item.id);
    setIgnoredIds(nextIgnored);

    const nextApplied = new Set(appliedIds);
    nextApplied.delete(item.id);
    setAppliedIds(nextApplied);

    if (projectId) {
      try {
        const res = await databaseApi.saveIndexState({
          projectId,
          appliedIndexes: Array.from(nextApplied),
          ignoredIndexes: Array.from(nextIgnored)
        });
        if (res.success) {
          setSummary(res.summary);
          setRecommendations(res.recommendations || []);
          setAllRecommendations(res.allRecommendations || []);
        }
      } catch (err) {
        console.error('Failed to save index state:', err.message);
      }
    } else {
      updateLocalSummary(nextApplied, nextIgnored);
    }
  };

  const handleRestoreIndex = async (item) => {
    const nextIgnored = new Set(ignoredIds);
    nextIgnored.delete(item.id);
    setIgnoredIds(nextIgnored);

    const nextApplied = new Set(appliedIds);
    nextApplied.delete(item.id);
    setAppliedIds(nextApplied);

    if (projectId) {
      try {
        const res = await databaseApi.saveIndexState({
          projectId,
          appliedIndexes: Array.from(nextApplied),
          ignoredIndexes: Array.from(nextIgnored)
        });
        if (res.success) {
          setSummary(res.summary);
          setRecommendations(res.recommendations || []);
          setAllRecommendations(res.allRecommendations || []);
        }
      } catch (err) {
        console.error('Failed to save index state:', err.message);
      }
    }
  };

  const handleApplyAll = async () => {
    const pendingItems = itemsToDisplay.filter((item) => item.status === 'Recommended' && !item.isExisting);
    const nextApplied = new Set(appliedIds);
    pendingItems.forEach((item) => nextApplied.add(item.id));
    setAppliedIds(nextApplied);

    if (projectId) {
      try {
        const res = await databaseApi.saveIndexState({
          projectId,
          appliedIndexes: Array.from(nextApplied),
          ignoredIndexes: Array.from(ignoredIds)
        });
        if (res.success) {
          setSummary(res.summary);
          setRecommendations(res.recommendations || []);
          setAllRecommendations(res.allRecommendations || []);
        }
      } catch (err) {
        console.error('Failed to apply all indexes:', err.message);
      }
    }
  };

  const updateLocalSummary = (applied, ignored) => {
    const pendingCount = recommendations.filter((r) => !applied.has(r.id) && !ignored.has(r.id)).length;
    const appliedCount = existingIndexes.length + applied.size;
    const newScore = Math.max(70, Math.min(98, 100 - pendingCount * 4));
    setSummary((prev) => ({
      ...prev,
      existingIndexes: appliedCount,
      recommendedIndexes: pendingCount,
      performanceScore: newScore,
      scoreLabel: newScore >= 90 ? 'Excellent' : 'Good'
    }));
  };

  const handleRunAiAnalysis = async () => {
    if (!projectId) return;
    setAiAnalyzing(true);
    try {
      const res = await databaseApi.runAiIndexAnalysis({ projectId });
      if (res.success) {
        setAiAnalysis(res.aiAnalysis);
        setRecommendations(res.recommendations || []);
        setAllRecommendations(res.allRecommendations || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      alert(`AI Deep Analysis failed: ${err.message}`);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleCopySql = (sql, id) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSql = () => {
    const pending = allRecommendations.filter((r) => !r.isExisting && (r.status === 'Recommended' || r.status === 'Applied'));
    const sqlText = `-- ==========================================================\n-- DevForge AI Generated Index Optimization Script\n-- Generated At: ${new Date().toLocaleString()}\n-- Total Recommendations: ${pending.length}\n-- ==========================================================\n\n` +
      pending.map((r) => `-- Table: ${r.table} | Priority: ${r.priority} | Reason: ${r.reason}\n${r.sql}\n`).join('\n');

    const blob = new Blob([sqlText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema_indexes_${projectId || 'project'}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Combine items for filtering
  const itemsToDisplay = [...allRecommendations].map((item) => {
    const isApplied = appliedIds.has(item.id);
    const isIgnored = ignoredIds.has(item.id);
    let currentStatus = item.status;
    if (isApplied) currentStatus = 'Applied';
    else if (isIgnored) currentStatus = 'Ignored';

    return { ...item, status: currentStatus };
  });

  // Filter items
  const filteredItems = itemsToDisplay.filter((item) => {
    // Category Filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    // Status Filter
    if (statusFilter === 'Pending' && (item.isExisting || item.status !== 'Recommended')) return false;
    if (statusFilter === 'Applied' && item.status !== 'Applied' && item.status !== 'Already Indexed' && item.status !== 'Already Optimized') return false;
    if (statusFilter === 'Ignored' && item.status !== 'Ignored') return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTable = (item.table || '').toLowerCase().includes(q);
      const matchCol = (item.column || '').toLowerCase().includes(q);
      const matchReason = (item.reason || '').toLowerCase().includes(q);
      const matchSql = (item.sql || '').toLowerCase().includes(q);
      if (!matchTable && !matchCol && !matchReason && !matchSql) return false;
    }

    return true;
  });

  // Sort items
  filteredItems.sort((a, b) => {
    if (sortBy === 'priority') {
      const pOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    }
    if (sortBy === 'table') {
      return (a.table || '').localeCompare(b.table || '');
    }
    if (sortBy === 'benefit') {
      const bOrder = { High: 3, Medium: 2, Low: 1 };
      return (bOrder[b.estimatedBenefit] || 0) - (bOrder[a.estimatedBenefit] || 0);
    }
    return 0;
  });

  const categoriesList = [
    'All',
    'Primary Key',
    'Foreign Key',
    'Composite',
    'Unique',
    'Search',
    'AI Suggested'
  ];

  const pendingRecommendations = itemsToDisplay.filter(r => !r.isExisting && r.status === 'Recommended');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ---------------------------------------------------- */}
      {/* AUTO REFRESH / OUTDATED BANNER */}
      {/* ---------------------------------------------------- */}
      {isOutdated && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">Schema Update Detected</h4>
              <p className="text-xs text-amber-300/80">
                The database schema has changed since the last index analysis. Regenerate recommendations to maintain peak performance.
              </p>
            </div>
          </div>
          <button
            onClick={() => loadIndexData()}
            disabled={loading}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Recommendations</span>
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DISPLAY SUMMARY REPORT HEADER */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-5 mb-6">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                <span>Database Index Report</span>
                <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] rounded-full border border-indigo-800 font-mono">
                  B-Tree & Composite Engine
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Automated index detection on Foreign Keys, Primary Keys, UNIQUE fields, composite multi-column query patterns & full-text lookups
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRunAiAnalysis}
              disabled={aiAnalyzing}
              className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${aiAnalyzing ? 'animate-spin' : ''}`} />
              <span>{aiAnalyzing ? 'Analyzing Workload...' : 'Run AI Deep Analysis'}</span>
            </button>

            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-medium flex items-center space-x-2 border border-gray-700 transition"
              title="Download SQL script for all recommended indexes"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download SQL</span>
            </button>

            <button
              onClick={() => loadIndexData()}
              disabled={loading}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition"
              title="Refresh Index Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0b0f17] border border-gray-800/80 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Total Tables</span>
              <TableIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{summary.totalTables}</div>
            <p className="text-[11px] text-gray-500">Active relational schema entities</p>
          </div>

          <div className="bg-[#0b0f17] border border-gray-800/80 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Existing Indexes</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{summary.existingIndexes}</div>
            <p className="text-[11px] text-emerald-400/80 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 inline" />
              <span>PKs, Unique & Applied</span>
            </p>
          </div>

          <div className="bg-[#0b0f17] border border-gray-800/80 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Recommended New Indexes</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{summary.recommendedIndexes}</div>
            <p className="text-[11px] text-amber-300/70">Actionable performance gains</p>
          </div>

          <div className="bg-[#0b0f17] border border-indigo-900/40 rounded-xl p-4 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Performance Score</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-full ${
                summary.performanceScore >= 90 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                summary.performanceScore >= 75 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-red-950 text-red-400 border border-red-800'
              }`}>
                {summary.scoreLabel}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white font-mono">{summary.performanceScore}</span>
              <span className="text-sm font-semibold text-gray-400 font-mono">/ 100</span>
            </div>

            {/* Live Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  summary.performanceScore >= 90 ? 'bg-emerald-400' :
                  summary.performanceScore >= 75 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${summary.performanceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown Row */}
        {summary.breakdown && (
          <div className="mt-5 pt-4 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>PK Indexes</span>
                <span className="text-emerald-400 font-bold">{summary.breakdown.pk}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div className="bg-emerald-400 h-1 rounded-full" style={{ width: `${summary.breakdown.pk}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>FK Indexes</span>
                <span className="text-indigo-400 font-bold">{summary.breakdown.fk}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div className="bg-indigo-400 h-1 rounded-full" style={{ width: `${summary.breakdown.fk}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Search Indexes</span>
                <span className="text-amber-400 font-bold">{summary.breakdown.search}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div className="bg-amber-400 h-1 rounded-full" style={{ width: `${summary.breakdown.search}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Composite Indexes</span>
                <span className="text-violet-400 font-bold">{summary.breakdown.composite}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div className="bg-violet-400 h-1 rounded-full" style={{ width: `${summary.breakdown.composite}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* GEMINI AI RECOMMENDATIONS SECTION */}
      {/* ---------------------------------------------------- */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-[#111827] border border-violet-800/40 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-violet-600/30 text-amber-300 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-violet-200 font-mono">Gemini AI Workload & Scaling Suggestions</h3>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {aiAnalysis.aiSummary}
          </p>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTROLS: FILTERS, SEARCH & SORT */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-thin">
          {categoriesList.map((cat) => {
            const count = cat === 'All'
              ? itemsToDisplay.length
              : itemsToDisplay.filter((i) => i.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-gray-800 text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar: Status, Search & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800/80">
          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-1 bg-[#0b0f17] border border-gray-800 rounded-xl p-1 text-xs font-medium">
            {['All', 'Pending', 'Applied', 'Ignored'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === st ? 'bg-gray-800 text-white font-semibold shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 flex-1 max-w-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search table or column..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b0f17] border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1 bg-[#0b0f17] border border-gray-800 rounded-xl px-2 py-1 text-xs text-gray-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none py-0.5 cursor-pointer font-mono"
              >
                <option value="priority" className="bg-[#111827]">Sort by Priority</option>
                <option value="table" className="bg-[#111827]">Sort by Table Name</option>
                <option value="benefit" className="bg-[#111827]">Sort by Benefit</option>
              </select>
            </div>

            {pendingRecommendations.length > 0 && (
              <button
                onClick={handleApplyAll}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow"
                title="Apply all pending recommendations"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply All ({pendingRecommendations.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* EMPTY STATE */}
      {/* ---------------------------------------------------- */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#111827] border border-emerald-900/40 rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-800/60 shadow-lg shadow-emerald-900/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-mono flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Current schema is well optimized.</span>
            </h3>
            <p className="text-xs text-emerald-400/90 font-mono">
              Performance Score: {summary.performanceScore} / 100 ({summary.scoreLabel})
            </p>
          </div>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            No additional indexes are currently recommended for your filter settings. Primary keys, Foreign Keys, and search indexes are appropriately configured.
          </p>
          {statusFilter !== 'All' && (
            <button
              onClick={() => { setStatusFilter('All'); setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl border border-gray-700 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* INDEX CARDS LIST */
        /* ---------------------------------------------------- */
        <div className="space-y-4">
          {filteredItems.map((rec) => {
            const isPk = rec.category === 'Primary Key';
            const isUq = rec.category === 'Unique';
            const isApplied = rec.status === 'Applied';
            const isIgnored = rec.status === 'Ignored';
            const isAlreadyIndexed = rec.status === 'Already Indexed' || rec.status === 'Already Optimized';

            const priorityColor =
              rec.priority === 'HIGH' ? 'bg-red-950 text-red-300 border-red-800' :
              rec.priority === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-800' :
              'bg-blue-950 text-blue-300 border-blue-800';

            return (
              <div
                key={rec.id}
                className={`bg-[#111827] border rounded-2xl p-5 space-y-4 transition shadow-lg ${
                  isApplied ? 'border-emerald-800/50 bg-[#111827]/80' :
                  isIgnored ? 'border-gray-800/60 opacity-65' :
                  'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-white bg-[#0b0f17] px-3 py-1 rounded-lg border border-gray-800">
                      {rec.table}.<span className="text-indigo-400">{rec.column}</span>
                    </span>

                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border ${priorityColor}`}>
                      {rec.priority} PRIORITY
                    </span>

                    <span className="px-2.5 py-0.5 bg-gray-900 text-gray-300 text-[10px] font-mono rounded-full border border-gray-800">
                      {rec.indexType}
                    </span>

                    {rec.isAiSuggested && (
                      <span className="px-2.5 py-0.5 bg-violet-950 text-violet-300 text-[10px] font-mono font-bold rounded-full border border-violet-800 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>AI Suggested</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                      isAlreadyIndexed ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      isApplied ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      isIgnored ? 'bg-gray-800 text-gray-400 border-gray-700' :
                      'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {rec.status}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center space-x-2">
                    {!isAlreadyIndexed && !isApplied && !isIgnored && (
                      <>
                        <button
                          onClick={() => handleApplyIndex(rec)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Apply Index</span>
                        </button>

                        <button
                          onClick={() => handleIgnoreIndex(rec)}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-xs font-medium transition border border-gray-700"
                        >
                          Ignore
                        </button>
                      </>
                    )}

                    {isApplied && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1 px-2.5 py-1 bg-emerald-950/60 rounded-lg border border-emerald-800/60">
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied to SQL</span>
                      </span>
                    )}

                    {isIgnored && (
                      <button
                        onClick={() => handleRestoreIndex(rec)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-xl transition border border-gray-700 flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopySql(rec.sql, rec.id)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition border border-gray-700"
                      title="Copy SQL statement"
                    >
                      {copiedId === rec.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-gray-300 leading-relaxed">
                      <strong className="text-white font-mono">Reason:</strong> {rec.reason}
                    </p>
                  </div>
                  <div className="text-right space-y-1 md:border-l md:border-gray-800/80 md:pl-4">
                    <span className="text-gray-400">Estimated Benefit: </span>
                    <span className={`font-bold font-mono ${
                      rec.estimatedBenefit === 'High' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {rec.estimatedBenefit} Speedup
                    </span>
                  </div>
                </div>

                {/* SQL Code Box */}
                <div className="relative group">
                  <div className="p-3.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto selection:bg-emerald-900 selection:text-white">
                    {rec.sql}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
