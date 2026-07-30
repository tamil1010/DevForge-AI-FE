import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Network,
  Code,
  TrendingUp,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  Zap
} from 'lucide-react';
import { databaseApi } from '../../api/client';

export default function ModifyDiffTab({ projectId, onNavigateTab }) {
  const [diffData, setDiffData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'entities' | 'relationships' | 'sql'

  useEffect(() => {
    if (projectId) {
      loadModifyDiff();
    }
  }, [projectId]);

  const loadModifyDiff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await databaseApi.getModifyDiff(projectId);
      if (res.diffRecord) {
        setDiffData(res.diffRecord);
      } else {
        setDiffData(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to load modification diff comparison.');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center space-y-4 max-w-5xl">
        <div className="flex justify-center">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h4 className="text-sm font-semibold text-white">Loading AI Modification Diff & Comparison...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111827] border border-red-800/60 rounded-xl p-8 text-center space-y-4 max-w-5xl">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h4 className="text-base font-bold text-red-400">Unable to load comparison diff</h4>
        <p className="text-xs text-gray-400 font-mono bg-[#0b0f17] p-2.5 rounded-lg max-w-lg mx-auto border border-gray-800/80">
          {error}
        </p>
        <button
          onClick={loadModifyDiff}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!diffData || !diffData.diff) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center text-gray-400 space-y-4 max-w-5xl">
        <div className="p-3 bg-purple-600/10 text-purple-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-purple-800/40">
          <GitCompare className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No AI Modifications Recorded Yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
            Run an <strong className="text-purple-400">AI Review</strong> and click <strong className="text-emerald-400">Modify</strong> to generate a side-by-side Before & After comparison.
          </p>
        </div>
        <div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('review')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-purple-600/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>Go to AI Review</span>
          </button>
        </div>
      </div>
    );
  }

  const { beforeScore, afterScore, diff, beforeSnapshot, afterSnapshot, createdAt } = diffData;
  const changesList = diff.changes || [];
  const scoreDiff = (afterScore || 100) - (beforeScore || 86);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner with Score Progression */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-indigo-950/40 to-gray-900 border border-emerald-800/50 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-700/50">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">AI Modification Diff & Architecture Comparison</h3>
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 font-mono text-xs font-bold rounded border border-emerald-700">
                  AI Applied Updates
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Detailed comparison showing design changes made before and after AI modification
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono bg-[#0b0f17] p-2.5 rounded-lg border border-gray-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-500 block">BEFORE</span>
              <span className="text-red-400 font-bold text-sm">{beforeScore}% Score</span>
            </div>

            <ArrowRight className="w-4 h-4 text-emerald-400" />

            <div className="text-center px-2">
              <span className="text-[10px] text-gray-500 block">AFTER</span>
              <span className="text-emerald-400 font-bold text-sm">{afterScore}% Score</span>
            </div>

            {scoreDiff > 0 && (
              <span className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">
                +{scoreDiff}% Improved
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-gray-400 pt-2 border-t border-gray-800/80">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>Modification Applied: <strong className="text-gray-200 font-mono">{formatDate(createdAt || diff.appliedAt)}</strong></span>
        </div>
      </div>

      {/* Mode Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-3 text-xs font-medium">
        <button
          onClick={() => setViewMode('summary')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
            viewMode === 'summary'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Changes Summary ({changesList.length})</span>
        </button>

        <button
          onClick={() => setViewMode('entities')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
            viewMode === 'entities'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Entities & Attributes Diff</span>
        </button>

        <button
          onClick={() => setViewMode('relationships')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
            viewMode === 'relationships'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Relationships Diff</span>
        </button>

        <button
          onClick={() => setViewMode('sql')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
            viewMode === 'sql'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>SQL DDL Diff</span>
        </button>
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Differentiated Changes List</h4>
          <div className="space-y-3">
            {changesList.map((chg, idx) => (
              <div key={idx} className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      chg.type === 'added' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      'bg-indigo-950 text-indigo-400 border border-indigo-800'
                    }`}>
                      {chg.category || 'Modification'}
                    </span>
                    <span className="font-semibold text-white text-sm">{chg.title}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-1">
                  <div className="bg-[#0b0f17] border border-red-950 p-2.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-red-400 block uppercase">Before AI Modify:</span>
                    <p className="text-gray-300">{chg.before}</p>
                  </div>

                  <div className="bg-[#0b0f17] border border-emerald-950 p-2.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">After AI Modify:</span>
                    <p className="text-emerald-300 font-semibold">{chg.after}</p>
                  </div>
                </div>

                {chg.description && (
                  <p className="text-xs text-gray-400 leading-relaxed pt-1">
                    {chg.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entities & Attributes Diff View */}
      {viewMode === 'entities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Entities */}
          <div className="bg-[#111827] border border-red-900/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-bold text-red-400 uppercase font-mono">Before AI Modify</span>
              <span className="text-[11px] text-gray-400 font-mono">{(beforeSnapshot?.entities || []).length} Entities</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
              {(beforeSnapshot?.entities || []).map((ent, idx) => (
                <div key={idx} className="bg-[#0b0f17] p-3 rounded-lg border border-gray-800 space-y-1">
                  <span className="font-bold text-white font-mono">{ent.name}</span>
                  <div className="text-[11px] text-gray-400 font-mono">
                    {(ent.attributes || []).map(a => `${a.name} (${a.type})`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* After Entities */}
          <div className="bg-[#111827] border border-emerald-900/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-bold text-emerald-400 uppercase font-mono">After AI Modify (Updated)</span>
              <span className="text-[11px] text-gray-400 font-mono">{(afterSnapshot?.entities || []).length} Entities</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
              {(afterSnapshot?.entities || []).map((ent, idx) => (
                <div key={idx} className="bg-[#0b0f17] p-3 rounded-lg border border-emerald-900/50 space-y-1">
                  <span className="font-bold text-emerald-300 font-mono">{ent.name}</span>
                  <div className="text-[11px] text-gray-300 font-mono">
                    {(ent.attributes || []).map(a => `${a.name} (${a.type})`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relationships Diff View */}
      {viewMode === 'relationships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111827] border border-red-900/40 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-red-400 uppercase font-mono block border-b border-gray-800 pb-2">
              Before AI Modify Relationships
            </span>
            <div className="space-y-2 text-xs font-mono">
              {(beforeSnapshot?.relationships || []).map((rel, idx) => (
                <div key={idx} className="bg-[#0b0f17] p-2.5 rounded-lg border border-gray-800">
                  <span className="text-white">{rel.source || rel.from}</span> → <span className="text-white">{rel.target || rel.to}</span>
                  <span className="text-gray-400 text-[11px] block mt-0.5">ON DELETE {rel.onDelete || 'CASCADE'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-emerald-900/40 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase font-mono block border-b border-gray-800 pb-2">
              After AI Modify Relationships (Updated)
            </span>
            <div className="space-y-2 text-xs font-mono">
              {(afterSnapshot?.relationships || []).map((rel, idx) => (
                <div key={idx} className="bg-[#0b0f17] p-2.5 rounded-lg border border-emerald-900/50">
                  <span className="text-emerald-300">{rel.source || rel.from}</span> → <span className="text-emerald-300">{rel.target || rel.to}</span>
                  <span className="text-emerald-400 font-bold text-[11px] block mt-0.5">ON DELETE {rel.onDelete || 'RESTRICT'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SQL DDL Diff View */}
      {viewMode === 'sql' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-red-400 font-mono block pb-2 border-b border-gray-800">
              Before DDL SQL
            </span>
            <pre className="bg-[#0b0f17] p-3 rounded-lg text-[11px] text-gray-400 font-mono overflow-x-auto max-h-96 whitespace-pre-wrap">
              {beforeSnapshot?.ddlSql || 'None'}
            </pre>
          </div>

          <div className="bg-[#111827] border border-emerald-900/50 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-400 font-mono block pb-2 border-b border-gray-800">
              After DDL SQL (Updated)
            </span>
            <pre className="bg-[#0b0f17] p-3 rounded-lg text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-96 whitespace-pre-wrap">
              {afterSnapshot?.ddlSql || 'None'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
