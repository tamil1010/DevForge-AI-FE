import React from 'react';
import { Database, Layers, Network, Table, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, FileText, Zap } from 'lucide-react';

export default function OverviewTab({ project }) {
  if (!project) return null;

  const domain = project.requirement?.domain || project.requirement?.analysis?.domain || 'Software System';
  const entitiesCount = project.entities?.length || 0;
  const tablesCount = project.schema?.tables?.length || entitiesCount;
  const relationshipsCount = project.relationships?.length || 0;

  // Compute foreign key count across schema
  let fkCount = 0;
  if (project.schema?.tables) {
    project.schema.tables.forEach((t) => {
      t.columns.forEach((c) => {
        if (c.isForeignKey) fkCount++;
      });
    });
  }

  const normStatus = project.normalizationStatus?.nf3?.status || 'Passed';
  const valScore = project.validation?.score !== undefined ? project.validation.score : 100;
  const indexRecsCount = (project.relationships?.length || 0) + (entitiesCount > 0 ? 2 : 0);

  const businessRules = project.requirement?.analysis?.businessRules || [];
  const assumptions = project.requirement?.analysis?.assumptions || [];
  const warnings = project.requirement?.analysis?.warnings || [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-[#111827] to-[#111827] border border-indigo-800/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Extracted System Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{project.name}</h2>
          <p className="text-xs text-gray-400 mt-1">
            Domain: <strong className="text-indigo-300">{domain}</strong> | Target Dialect: <strong className="text-indigo-300 font-mono">{project.database_type || 'PostgreSQL'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-center">
            <div className="text-xs text-emerald-400 font-medium">Design Score</div>
            <div className="text-xl font-bold text-emerald-300 font-mono">{valScore} / 100</div>
          </div>
          <div className="px-4 py-2 bg-indigo-950/60 border border-indigo-800/60 rounded-xl text-center">
            <div className="text-xs text-indigo-400 font-medium">3NF Normalization</div>
            <div className="text-xl font-bold text-indigo-300 font-mono">{normStatus}</div>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs font-mono">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-gray-400 text-[10px] uppercase font-sans">Entities</div>
          <div className="text-2xl font-bold text-white flex items-center justify-between">
            <span>{entitiesCount}</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-gray-400 text-[10px] uppercase font-sans">Relational Tables</div>
          <div className="text-2xl font-bold text-white flex items-center justify-between">
            <span>{tablesCount}</span>
            <Table className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-gray-400 text-[10px] uppercase font-sans">Relationships</div>
          <div className="text-2xl font-bold text-white flex items-center justify-between">
            <span>{relationshipsCount}</span>
            <Network className="w-4 h-4 text-indigo-400" />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-gray-400 text-[10px] uppercase font-sans">Foreign Keys</div>
          <div className="text-2xl font-bold text-white flex items-center justify-between">
            <span>{fkCount}</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-gray-400 text-[10px] uppercase font-sans">Indexes Recs</div>
          <div className="text-2xl font-bold text-white flex items-center justify-between">
            <span>{indexRecsCount}</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-gray-400 text-[10px] uppercase font-sans">Validation</div>
          <div className="text-2xl font-bold text-emerald-400 flex items-center justify-between">
            <span>{valScore}%</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Requirement Summary & Business Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Original Requirement Prompt</span>
          </h3>
          <div className="p-3 bg-[#0b0f17] border border-gray-800 rounded-lg text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {project.requirement?.raw_text || 'No requirement prompt recorded.'}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Extracted Business Rules</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-300 max-h-48 overflow-y-auto">
            {businessRules.length > 0 ? (
              businessRules.map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">Business rules inferred from entities and foreign key constraints.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Assumptions & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Architecture Assumptions</span>
          </h3>
          <div className="space-y-2 text-xs">
            {assumptions.length > 0 ? (
              assumptions.map((asm, idx) => (
                <div key={idx} className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300">
                  <strong className="text-purple-300">Assumption:</strong> {asm}
                </div>
              ))
            ) : (
              <div className="text-gray-500">Standard 3NF database design assumptions applied.</div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Warnings & Ambiguities</span>
          </h3>
          <div className="space-y-2 text-xs">
            {warnings.length > 0 ? (
              warnings.map((warn, idx) => (
                <div key={idx} className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300">
                  <strong className="text-amber-400">Warning:</strong> {warn}
                </div>
              ))
            ) : (
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300">
                No critical ambiguities detected in original requirement prompt.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
