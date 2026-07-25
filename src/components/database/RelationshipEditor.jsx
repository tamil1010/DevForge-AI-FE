import React, { useState } from 'react';
import { Network, Plus, Trash2, Save, ArrowRight, AlertCircle } from 'lucide-react';

export default function RelationshipEditor({ entities = [], relationships = [], onSaveRelationships }) {
  const [relList, setRelList] = useState(JSON.parse(JSON.stringify(relationships)));
  const [error, setError] = useState('');

  const entityNames = entities.map((e) => e.name);

  const handleAddRelationship = () => {
    if (entityNames.length < 2) {
      setError('You must have at least 2 entities defined to create relationships.');
      return;
    }
    const newRel = {
      source: entityNames[0],
      target: entityNames[1] || entityNames[0],
      type: 'one-to-many',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      description: ''
    };
    setRelList([...relList, newRel]);
    setError('');
  };

  const handleDeleteRelationship = (idx) => {
    setRelList(relList.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSaveRelationships(relList);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Relationship & Cardinality Designer</h3>
            <p className="text-xs text-gray-400">Configure foreign keys, 1:N / N:M cardinalities, and referential integrity actions</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddRelationship}
            className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Relationship</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Relationships</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Relationship List Cards */}
      <div className="space-y-4">
        {relList.map((rel, idx) => (
          <div key={idx} className="bg-[#111827] border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
              <div className="flex items-center space-x-3 text-sm font-mono text-white font-semibold">
                <span className="text-indigo-400">{rel.source || rel.from}</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <span className="text-purple-400">{rel.target || rel.to}</span>
                <span className="text-xs px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-800/50 font-sans">
                  {rel.type}
                </span>
              </div>

              <button
                onClick={() => handleDeleteRelationship(idx)}
                className="p-1.5 text-gray-400 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Source Entity</label>
                <select
                  value={rel.source || rel.from}
                  onChange={(e) => {
                    const updated = [...relList];
                    updated[idx].source = e.target.value;
                    updated[idx].from = e.target.value;
                    setRelList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded text-white"
                >
                  {entityNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Target Entity</label>
                <select
                  value={rel.target || rel.to}
                  onChange={(e) => {
                    const updated = [...relList];
                    updated[idx].target = e.target.value;
                    updated[idx].to = e.target.value;
                    setRelList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded text-white"
                >
                  {entityNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Cardinality Type</label>
                <select
                  value={rel.type}
                  onChange={(e) => {
                    const updated = [...relList];
                    updated[idx].type = e.target.value;
                    setRelList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded text-indigo-300 font-semibold"
                >
                  <option value="one-to-many">One-to-Many (1:N)</option>
                  <option value="one-to-one">One-to-One (1:1)</option>
                  <option value="many-to-one">Many-to-One (N:1)</option>
                  <option value="many-to-many">Many-to-Many (M:N)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">ON DELETE Rule</label>
                <select
                  value={rel.onDelete || 'CASCADE'}
                  onChange={(e) => {
                    const updated = [...relList];
                    updated[idx].onDelete = e.target.value;
                    setRelList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded text-white"
                >
                  <option value="CASCADE">CASCADE</option>
                  <option value="SET NULL">SET NULL</option>
                  <option value="RESTRICT">RESTRICT</option>
                  <option value="NO ACTION">NO ACTION</option>
                </select>
              </div>
            </div>

            {rel.type === 'many-to-many' && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-lg text-xs text-indigo-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>
                  <strong>Junction Table Auto-Generation:</strong> Many-to-Many relationship between{' '}
                  <span className="font-mono">{rel.source}</span> and <span className="font-mono">{rel.target}</span> will automatically generate a junction table{' '}
                  <span className="font-mono text-white font-bold">{rel.source}_{rel.target}</span> with composite primary keys.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
