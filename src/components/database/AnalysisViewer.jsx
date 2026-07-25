import React from 'react';
import { Layers, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

export default function AnalysisViewer({ analysis, onContinue }) {
  if (!analysis) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
        <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white">No AI Requirement Analysis Available</h4>
        <p className="text-xs text-gray-400 mt-1">Run AI Requirement Analysis to extract domain, entities, and business rules.</p>
      </div>
    );
  }

  const { domain, entities = [], relationships = [], businessRules = [], assumptions = [], warnings = [] } = analysis;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-gray-900 border border-indigo-800/40 rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">Extracted System Domain</div>
          <h2 className="text-2xl font-bold text-white">{domain}</h2>
          <p className="text-xs text-gray-400 mt-1">
            Detected <span className="text-indigo-300 font-semibold">{entities.length} Entities</span> and{' '}
            <span className="text-indigo-300 font-semibold">{relationships.length} Relationships</span>
          </p>
        </div>
        <button
          onClick={onContinue}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition"
        >
          <span>Continue to Entity Designer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entities Summary Card */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Detected Entities ({entities.length})</span>
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {entities.map((e, idx) => (
              <div key={idx} className="bg-[#1f2937] border border-gray-700/60 rounded-lg px-3 py-1.5 text-xs font-mono text-indigo-300">
                {e.name} <span className="text-gray-500">({e.attributes?.length || 0} attrs)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Relationships Summary Card */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Detected Relationships ({relationships.length})</span>
            </h3>
          </div>
          <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
            {relationships.map((r, idx) => (
              <div key={idx} className="bg-[#1f2937] border border-gray-800 rounded-lg p-2 text-xs flex items-center justify-between">
                <span className="font-mono text-gray-200">{r.source || r.from} → {r.target || r.to}</span>
                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-800/40 font-mono text-[10px]">
                  {r.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Rules & Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Business Rules & Constraints</span>
          </h3>
          <ul className="space-y-2 pt-1 text-xs text-gray-300">
            {businessRules.map((rule, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Assumptions & Warnings</span>
          </h3>
          <div className="space-y-3 pt-1 text-xs">
            {assumptions.map((asm, idx) => (
              <div key={idx} className="p-2 bg-gray-800/50 rounded border border-gray-700/50 text-gray-300">
                <strong className="text-amber-300">Assumption:</strong> {asm}
              </div>
            ))}
            {warnings.map((warn, idx) => (
              <div key={idx} className="p-2 bg-amber-950/30 border border-amber-800/40 rounded text-amber-300">
                <strong className="text-amber-400">Warning:</strong> {warn}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
