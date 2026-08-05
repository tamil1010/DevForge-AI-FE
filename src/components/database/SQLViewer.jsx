import React, { useState } from 'react';
import { Code, Copy, Download, RefreshCw, Check, Maximize2, Minimize2, Database } from 'lucide-react';

export default function SQLViewer({ generatedSql, currentDialect, onRegenerateSql, isLoading }) {
  const [activeTab, setActiveTab] = useState('ddl'); // 'ddl' | 'sample'
  const [dialect, setDialect] = useState(currentDialect || 'PostgreSQL');
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const ddlCode = generatedSql?.ddl_sql || '-- Click Regenerate SQL to build executable DDL statements.';
  const sampleCode = generatedSql?.sample_data_sql || '-- Click Regenerate SQL to generate sample INSERT statements.';

  const currentCode = activeTab === 'ddl' ? ddlCode : sampleCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `database_${dialect.toLowerCase()}_${activeTab}.sql`;
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDialectChange = (newDialect) => {
    setDialect(newDialect);
    onRegenerateSql(newDialect);
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0b0f17] p-6 overflow-y-auto' : ''}`}>
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-3 gap-3">
        {/* Dialect and Tabs */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-[#1f2937] border border-gray-700/60 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('ddl')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                activeTab === 'ddl' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              DDL Script
            </button>
            <button
              onClick={() => setActiveTab('sample')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                activeTab === 'sample' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sample Data (DML)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <select
              value={dialect}
              onChange={(e) => handleDialectChange(e.target.value)}
              className="px-2.5 py-1 bg-[#1f2937] border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-medium"
            >
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="MySQL">MySQL</option>
              <option value="SQLite">SQLite</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`px-2.5 py-1 text-xs border rounded transition ${
              wordWrap ? 'bg-indigo-950 border-indigo-700 text-indigo-300' : 'border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Wrap
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-medium flex items-center space-x-1 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-medium flex items-center space-x-1 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql</span>
          </button>
          <button
            onClick={() => onRegenerateSql(dialect)}
            disabled={isLoading}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center space-x-1 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-gray-400 hover:text-white transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor View */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-4 py-2 bg-[#1e293b]/60 border-b border-gray-800 text-[11px] font-mono text-gray-400 flex items-center justify-between">
          <span>Target Dialect: {dialect}</span>
          <span>{currentCode.split('\n').length} Lines</span>
        </div>
        <textarea
          readOnly
          value={currentCode}
          rows={isFullscreen ? 30 : 20}
          className={`w-full p-4 bg-[#090d16] text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none select-all ${
            wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
          }`}
        />
      </div>
    </div>
  );
}
