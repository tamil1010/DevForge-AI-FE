import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Lightbulb, Wrench, RefreshCw } from 'lucide-react';

export default function ValidationPanel({ validation, onValidate, onAutoFix, isLoading }) {
  if (!validation) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
        <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white">No Validation Results Available</h4>
        <p className="text-xs text-gray-400 mt-1 mb-4">Validate your database design for structural errors, broken foreign keys, and SQL compatibility issues.</p>
        <button
          onClick={onValidate}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow transition"
        >
          Run Schema & SQL Validation
        </button>
      </div>
    );
  }

  const { score = 100, isValid = true, breakdown = {}, issues = [] } = validation;

  const errors = issues.filter((i) => i.severity === 'ERRORS' || i.type === 'ERROR');
  const warnings = issues.filter((i) => i.severity === 'WARNINGS' || i.type === 'WARNING');
  const suggestions = issues.filter((i) => i.severity === 'SUGGESTIONS' || i.type === 'SUGGESTION');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Validation Score Overview Banner */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${
            score >= 90 ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' :
            score >= 70 ? 'border-amber-500 text-amber-400 bg-amber-950/30' :
            'border-red-500 text-red-400 bg-red-950/30'
          }`}>
            <span className="text-2xl font-bold font-mono">{score}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">/ 100</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Database Design Score</h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase ${
                isValid ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
              }`}>
                {isValid ? 'VALID' : 'ISSUES DETECTED'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Found <span className="text-red-400 font-semibold">{errors.length} Errors</span>,{' '}
              <span className="text-amber-400 font-semibold">{warnings.length} Warnings</span>, and{' '}
              <span className="text-indigo-400 font-semibold">{suggestions.length} Suggestions</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {warnings.length > 0 || errors.length > 0 ? (
            <button
              onClick={onAutoFix}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              <Wrench className="w-4 h-4" />
              <span>Auto Fix Safe Issues</span>
            </button>
          ) : null}
          <button
            onClick={onValidate}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Validate</span>
          </button>
        </div>
      </div>

      {/* Score Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {Object.entries(breakdown).map(([key, val], idx) => (
          <div key={idx} className="bg-[#111827] border border-gray-800 rounded-lg p-3 space-y-1">
            <div className="text-gray-400 text-[11px] uppercase tracking-wider capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-white text-base">{val}</span>
              <span className={`text-[10px] font-bold ${val >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {val >= 90 ? 'EXCELLENT' : 'CHECK'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Categorized Issues List */}
      <div className="space-y-4">
        {/* Errors */}
        {errors.map((issue, idx) => (
          <div key={idx} className="bg-red-950/20 border border-red-800/60 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-red-400 font-bold">
              <AlertOctagon className="w-4 h-4" />
              <span>{issue.title}</span>
              <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded text-red-300 border border-red-800">
                {issue.location}
              </span>
            </div>
            <p className="text-gray-300"><strong className="text-white">Problem:</strong> {issue.problem}</p>
            <p className="text-gray-400"><strong className="text-gray-300">Why it matters:</strong> {issue.whyItMatters || issue.explanation}</p>
            <div className="p-2 bg-red-900/30 rounded border border-red-700/40 text-red-200 font-mono text-[11px]">
              <strong>Suggested Fix:</strong> {issue.suggestedFix}
            </div>
          </div>
        ))}

        {/* Warnings */}
        {warnings.map((issue, idx) => (
          <div key={idx} className="bg-amber-950/20 border border-amber-800/60 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{issue.title}</span>
              <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded text-amber-300 border border-amber-800">
                {issue.location}
              </span>
            </div>
            <p className="text-gray-300"><strong className="text-white">Problem:</strong> {issue.problem}</p>
            <p className="text-gray-400"><strong className="text-gray-300">Why it matters:</strong> {issue.whyItMatters || issue.explanation}</p>
            <div className="p-2 bg-amber-900/30 rounded border border-amber-700/40 text-amber-200 font-mono text-[11px]">
              <strong>Suggested Fix:</strong> {issue.suggestedFix}
            </div>
          </div>
        ))}

        {/* Suggestions */}
        {suggestions.map((issue, idx) => (
          <div key={idx} className="bg-indigo-950/20 border border-indigo-800/60 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>{issue.title}</span>
              <span className="text-[10px] bg-indigo-950 px-2 py-0.5 rounded text-indigo-300 border border-indigo-800">
                {issue.location}
              </span>
            </div>
            <p className="text-gray-300"><strong className="text-white">Problem:</strong> {issue.problem}</p>
            <p className="text-gray-400"><strong className="text-gray-300">Why it matters:</strong> {issue.whyItMatters || issue.explanation}</p>
            <div className="p-2 bg-indigo-900/30 rounded border border-indigo-700/40 text-indigo-200 font-mono text-[11px]">
              <strong>Suggested Fix:</strong> {issue.suggestedFix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
