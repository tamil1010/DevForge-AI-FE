import React, { useState } from 'react';
import { Database, Plus, Check, Zap } from 'lucide-react';

export default function IndexRecommendations({ recommendations = [], onApplyIndex }) {
  const [recList, setRecList] = useState(recommendations);

  const handleApply = (idx) => {
    const item = recList[idx];
    if (onApplyIndex) onApplyIndex(item);
    setRecList(recList.filter((_, i) => i !== idx));
  };

  const handleIgnore = (idx) => {
    setRecList(recList.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">B-Tree Index Recommendation Engine</h3>
            <p className="text-xs text-gray-400">Automated index detection on Foreign Keys, Primary Keys, and high-frequency search fields</p>
          </div>
        </div>
      </div>

      {recList.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
          No additional index recommendations detected for this database schema.
        </div>
      ) : (
        <div className="space-y-4">
          {recList.map((rec, idx) => (
            <div key={idx} className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-white">{rec.table}.{rec.column}</span>
                  <span className="px-2.5 py-0.5 bg-amber-950 text-amber-300 text-[10px] font-mono rounded border border-amber-800/60">
                    {rec.indexType}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApply(idx)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to SQL</span>
                  </button>
                  <button
                    onClick={() => handleIgnore(idx)}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-xs font-medium transition"
                  >
                    Ignore
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-300"><strong className="text-white">Reason:</strong> {rec.reason}</p>
              <div className="p-3 bg-[#0b0f17] border border-gray-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto">
                {rec.sql}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
