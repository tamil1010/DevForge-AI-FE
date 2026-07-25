import React, { useState } from 'react';
import { FileText, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RequirementEditor({ project, onReanalyze, isLoading }) {
  const [text, setText] = useState(project?.requirement?.raw_text || '');
  const [dbType, setDbType] = useState(project?.database_type || 'PostgreSQL');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveAndReanalyze = () => {
    if (!text.trim()) return;
    onReanalyze({
      requirement: text.trim(),
      databaseType: dbType
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Natural-Language Software Requirement</h3>
              <p className="text-xs text-gray-400">Target Dialect: <span className="text-indigo-400 font-mono font-medium">{dbType}</span></p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs px-3 py-1.5 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-300 transition"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Requirement'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Target Database Dialect</label>
              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value)}
                className="w-full max-w-xs px-3 py-2 bg-[#1f2937] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MySQL">MySQL</option>
                <option value="SQLite">SQLite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Requirement Statement</label>
              <textarea
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="p-3 bg-amber-900/20 border border-amber-800/40 rounded-lg flex items-start space-x-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Updating requirement text will re-run AI Requirement Analysis and flag downstream Entities, Schemas, and SQL as <strong>Outdated</strong>.</span>
            </div>
            <button
              onClick={handleSaveAndReanalyze}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-Analyze Requirement</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#1a2234] border border-gray-800 rounded-lg p-5">
            <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
              {project?.requirement?.raw_text || 'No requirement text provided.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
