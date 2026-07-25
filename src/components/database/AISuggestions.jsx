import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldAlert, Cpu } from 'lucide-react';

export default function AISuggestions({ suggestions = [], onReviewAi, isLoading }) {
  const [suggestionList, setSuggestionList] = useState(suggestions);

  const handleApply = (idx) => {
    setSuggestionList(suggestionList.filter((_, i) => i !== idx));
  };

  const handleIgnore = (idx) => {
    setSuggestionList(suggestionList.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-gray-900 border border-purple-800/40 rounded-xl p-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Database Review & Architecture Audit</h3>
            <p className="text-xs text-gray-400">Intelligent suggestions for index placement, 3NF normalization, and datatype optimization</p>
          </div>
        </div>

        <button
          onClick={onReviewAi}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
        >
          <Cpu className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Review With AI</span>
        </button>
      </div>

      {suggestionList.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
          No critical AI database design recommendations. Click <strong>Review With AI</strong> to analyze your schema.
        </div>
      ) : (
        <div className="space-y-4">
          {suggestionList.map((item, idx) => (
            <div key={idx} className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    item.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                    item.severity === 'Warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  }`}>
                    {item.severity || 'Improvement'}
                  </span>
                  <span className="font-semibold text-white text-sm">{item.title}</span>
                  {item.category && (
                    <span className="text-xs text-gray-500 font-mono">[{item.category}]</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApply(idx)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply</span>
                  </button>
                  <button
                    onClick={() => handleIgnore(idx)}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-xs font-medium flex items-center space-x-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Ignore</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-300"><strong className="text-white">Reason:</strong> {item.reason || item.description}</p>

              {item.recommendedChange && (
                <div className="p-3 bg-[#0b0f17] border border-gray-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto">
                  {item.recommendedChange}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
