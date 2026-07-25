import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Key, Link2, Copy, Layers, Save } from 'lucide-react';

const SUPPORTED_DATATYPES = [
  'INTEGER', 'BIGINT', 'SMALLINT', 'VARCHAR(255)', 'VARCHAR(100)', 'VARCHAR(50)',
  'CHAR(10)', 'TEXT', 'BOOLEAN', 'DATE', 'TIME', 'TIMESTAMP', 'DECIMAL(10,2)',
  'NUMERIC', 'FLOAT', 'DOUBLE', 'UUID', 'JSON'
];

export default function EntityEditor({ entities = [], onSaveEntities, onContinue }) {
  const [entityList, setEntityList] = useState(JSON.parse(JSON.stringify(entities)));
  const [selectedEntityIdx, setSelectedEntityIdx] = useState(0);
  const [editingAttr, setEditingAttr] = useState(null); // { entityIdx, attrIdx, data }
  const [error, setError] = useState('');

  // Add new entity
  const handleAddEntity = () => {
    const newName = `NewEntity_${entityList.length + 1}`;
    const newEntity = {
      name: newName,
      attributes: [
        {
          name: `${newName.toLowerCase()}_id`,
          type: 'INTEGER',
          primaryKey: true,
          foreignKey: false,
          nullable: false,
          unique: true,
          autoIncrement: true,
          defaultValue: null
        }
      ]
    };
    const updated = [...entityList, newEntity];
    setEntityList(updated);
    setSelectedEntityIdx(updated.length - 1);
  };

  // Delete entity
  const handleDeleteEntity = (idx) => {
    if (entityList.length <= 1) {
      setError('A database design must contain at least one entity.');
      return;
    }
    const updated = entityList.filter((_, i) => i !== idx);
    setEntityList(updated);
    setSelectedEntityIdx(Math.max(0, idx - 1));
  };

  // Duplicate entity
  const handleDuplicateEntity = (idx) => {
    const target = entityList[idx];
    const clone = JSON.parse(JSON.stringify(target));
    clone.name = `${target.name}_Copy`;
    const updated = [...entityList, clone];
    setEntityList(updated);
    setSelectedEntityIdx(updated.length - 1);
  };

  // Add attribute to active entity
  const handleAddAttribute = () => {
    if (!entityList[selectedEntityIdx]) return;
    const active = { ...entityList[selectedEntityIdx] };
    const newAttr = {
      name: `column_${active.attributes.length + 1}`,
      type: 'VARCHAR(255)',
      primaryKey: false,
      foreignKey: false,
      nullable: true,
      unique: false,
      autoIncrement: false,
      defaultValue: null
    };
    active.attributes.push(newAttr);
    const updated = [...entityList];
    updated[selectedEntityIdx] = active;
    setEntityList(updated);
  };

  // Save changes
  const handleSave = () => {
    // Validate empty or duplicate names
    const names = new Set();
    for (let e of entityList) {
      if (!e.name.trim()) {
        setError('Entity names cannot be empty.');
        return;
      }
      if (names.has(e.name.toLowerCase())) {
        setError(`Duplicate entity name: '${e.name}'`);
        return;
      }
      names.add(e.name.toLowerCase());

      const hasPk = e.attributes.some((a) => a.primaryKey);
      if (!hasPk) {
        setError(`Entity '${e.name}' is missing a primary key.`);
        return;
      }
    }

    setError('');
    onSaveEntities(entityList);
  };

  const currentEntity = entityList[selectedEntityIdx] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Visual Entity & Attribute Designer</h3>
            <p className="text-xs text-gray-400">Define tables, primary keys, datatypes, and constraints</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddEntity}
            className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Entity</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Entity Model</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Entity List Sidebar */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
            Entities ({entityList.length})
          </div>
          {entityList.map((e, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedEntityIdx(idx)}
              className={`p-3 rounded-lg cursor-pointer flex items-center justify-between text-xs transition ${
                selectedEntityIdx === idx
                  ? 'bg-indigo-600/20 border border-indigo-500/50 text-white font-medium'
                  : 'hover:bg-gray-800/60 text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Layers className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{e.name}</span>
              </div>
              <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                {e.attributes.length}
              </span>
            </div>
          ))}
        </div>

        {/* Right Active Entity Attribute Editor Table */}
        {currentEntity && (
          <div className="md:col-span-3 bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={currentEntity.name}
                  onChange={(e) => {
                    const updated = [...entityList];
                    updated[selectedEntityIdx].name = e.target.value;
                    setEntityList(updated);
                  }}
                  className="px-3 py-1.5 bg-[#1f2937] border border-gray-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDuplicateEntity(selectedEntityIdx)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                  title="Duplicate Entity"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEntity(selectedEntityIdx)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition"
                  title="Delete Entity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Attributes Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Attribute Name</th>
                    <th className="py-2.5 px-3">Data Type</th>
                    <th className="py-2.5 px-3 text-center">PK</th>
                    <th className="py-2.5 px-3 text-center">FK</th>
                    <th className="py-2.5 px-3 text-center">Nullable</th>
                    <th className="py-2.5 px-3 text-center">Unique</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {currentEntity.attributes.map((attr, aIdx) => (
                    <tr key={aIdx} className="hover:bg-gray-800/40 font-mono">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) => {
                            const updated = [...entityList];
                            updated[selectedEntityIdx].attributes[aIdx].name = e.target.value;
                            setEntityList(updated);
                          }}
                          className="w-full px-2 py-1 bg-[#1f2937] border border-gray-700/60 rounded text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={attr.type}
                          onChange={(e) => {
                            const updated = [...entityList];
                            updated[selectedEntityIdx].attributes[aIdx].type = e.target.value;
                            setEntityList(updated);
                          }}
                          className="px-2 py-1 bg-[#1f2937] border border-gray-700/60 rounded text-indigo-300 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          {SUPPORTED_DATATYPES.map((dt) => (
                            <option key={dt} value={dt}>
                              {dt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={attr.primaryKey}
                          onChange={(e) => {
                            const updated = [...entityList];
                            updated[selectedEntityIdx].attributes[aIdx].primaryKey = e.target.checked;
                            if (e.target.checked) updated[selectedEntityIdx].attributes[aIdx].nullable = false;
                            setEntityList(updated);
                          }}
                          className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={attr.foreignKey}
                          onChange={(e) => {
                            const updated = [...entityList];
                            updated[selectedEntityIdx].attributes[aIdx].foreignKey = e.target.checked;
                            setEntityList(updated);
                          }}
                          className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={attr.nullable}
                          disabled={attr.primaryKey}
                          onChange={(e) => {
                            const updated = [...entityList];
                            updated[selectedEntityIdx].attributes[aIdx].nullable = e.target.checked;
                            setEntityList(updated);
                          }}
                          className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={attr.unique}
                          onChange={(e) => {
                            const updated = [...entityList];
                            updated[selectedEntityIdx].attributes[aIdx].unique = e.target.checked;
                            setEntityList(updated);
                          }}
                          className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => {
                            const updated = [...entityList];
                            updated[selectedEntityIdx].attributes = updated[selectedEntityIdx].attributes.filter(
                              (_, i) => i !== aIdx
                            );
                            setEntityList(updated);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleAddAttribute}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition border border-dashed border-gray-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Attribute</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
