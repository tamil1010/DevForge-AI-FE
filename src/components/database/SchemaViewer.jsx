import React from 'react';
import { Table, Key, Link, ShieldCheck, RefreshCw } from 'lucide-react';

export default function SchemaViewer({ schema, normalizationStatus, onRegenerateSchema, isLoading }) {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
        <Table className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white">No Schema Generated Yet</h4>
        <p className="text-xs text-gray-400 mt-1 mb-4">Transform your Entity and Relationship models into a relational database schema.</p>
        <button
          onClick={onRegenerateSchema}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow transition"
        >
          Generate Relational Schema
        </button>
      </div>
    );
  }

  const { nf1, nf2, nf3, overallScore } = normalizationStatus || {
    nf1: { status: 'Passed' },
    nf2: { status: 'Passed' },
    nf3: { status: 'Passed' },
    overallScore: 100
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner with Normalization Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-5 gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Table className="w-5 h-5 text-indigo-400" />
            <span>3NF Relational Schema Model ({schema.tables.length} Tables)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Normalized relational database structure generated deterministically</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Normalization Status Pills */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-lg font-mono">
              1NF: <strong>{nf1?.status || 'Passed'}</strong>
            </div>
            <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-lg font-mono">
              2NF: <strong>{nf2?.status || 'Passed'}</strong>
            </div>
            <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-lg font-mono">
              3NF: <strong>{nf3?.status || 'Passed'}</strong>
            </div>
          </div>

          <button
            onClick={onRegenerateSchema}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Relational Tables View */}
      <div className="grid grid-cols-1 gap-6">
        {schema.tables.map((table, tIdx) => (
          <div key={tIdx} className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-[#151c2c] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white uppercase tracking-wide">{table.name}</span>
                {table.isJunctionTable && (
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] font-mono rounded border border-indigo-800/60">
                    Junction Table
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">{table.columns.length} Columns</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-semibold text-[10px] uppercase tracking-wider bg-[#111827]">
                    <th className="py-2.5 px-4">Column Name</th>
                    <th className="py-2.5 px-4">Datatype</th>
                    <th className="py-2.5 px-4 text-center">Key Constraint</th>
                    <th className="py-2.5 px-4 text-center">Nullable</th>
                    <th className="py-2.5 px-4 text-center">Unique</th>
                    <th className="py-2.5 px-4">Foreign Key Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {table.columns.map((col, cIdx) => (
                    <tr key={cIdx} className="hover:bg-gray-800/30">
                      <td className="py-2.5 px-4 font-semibold text-white flex items-center space-x-1.5">
                        {col.isPrimaryKey && <Key className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        {col.isForeignKey && <Link className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                        <span>{col.name}</span>
                      </td>
                      <td className="py-2.5 px-4 text-indigo-300">{col.dataType}</td>
                      <td className="py-2.5 px-4 text-center">
                        {col.isPrimaryKey ? (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded text-[10px] border border-amber-800/50 font-bold">
                            PK
                          </span>
                        ) : col.isForeignKey ? (
                          <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[10px] border border-indigo-800/50">
                            FK
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {col.isNullable ? <span className="text-gray-400">YES</span> : <span className="text-emerald-400 font-semibold">NO</span>}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {col.isUnique ? <span className="text-purple-400 font-semibold">YES</span> : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="py-2.5 px-4 text-gray-400">
                        {col.references ? (
                          <span className="text-indigo-300 font-mono text-[11px]">
                            {col.references.table}.{col.references.column}
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
