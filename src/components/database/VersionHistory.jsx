import React, { useState } from 'react';
import { History, Plus, RotateCcw, GitCompare, CheckCircle2 } from 'lucide-react';
import { versionApi } from '../../api/client';

export default function VersionHistory({ projectId, versions = [], onVersionRestored }) {
  const [versionList, setVersionList] = useState(versions);
  const [comparing, setComparing] = useState(null); // { v1, v2, diff }
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateSnapshot = async () => {
    setIsLoading(true);
    try {
      const res = await versionApi.createVersion(projectId);
      if (res.version) {
        setVersionList([res.version, ...versionList]);
        setMessage(`Snapshot Version ${res.version.version_number} created.`);
      }
    } catch (err) {
      setMessage(`Failed to create version snapshot: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (vNumber) => {
    if (!window.confirm(`Are you sure you want to restore Version ${vNumber}? Current state will be backed up automatically.`)) return;
    setIsLoading(true);
    try {
      const res = await versionApi.restoreVersion(projectId, vNumber);
      setMessage(res.message || `Restored Version ${vNumber}.`);
      if (onVersionRestored) onVersionRestored();
    } catch (err) {
      setMessage(`Restore failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (v1, v2) => {
    setIsLoading(true);
    try {
      const res = await versionApi.compareVersions(projectId, v1, v2);
      setComparing({ v1, v2, diff: res.diff });
    } catch (err) {
      setMessage(`Compare failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Project Version History & Immutable Snapshots</h3>
            <p className="text-xs text-gray-400">Save points, version comparison diffs, and safe rollback restoration</p>
          </div>
        </div>

        <button
          onClick={handleCreateSnapshot}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Create Version Snapshot</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Version Comparison Modal overlay if active */}
      {comparing && (
        <div className="bg-[#151c2c] border border-indigo-800/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <GitCompare className="w-4 h-4 text-indigo-400" />
              <span>Comparing Version {comparing.v1} vs Version {comparing.v2}</span>
            </div>
            <button onClick={() => setComparing(null)} className="text-gray-400 hover:text-white text-xs">
              Close Diff
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#0b0f17] border border-emerald-800/40 rounded-lg space-y-1">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Added Tables</span>
              {comparing.diff?.addedTables?.length ? (
                comparing.diff.addedTables.map((t, idx) => <div key={idx} className="font-mono text-emerald-300">+ {t}</div>)
              ) : (
                <div className="text-gray-500">None</div>
              )}
            </div>

            <div className="p-3 bg-[#0b0f17] border border-red-800/40 rounded-lg space-y-1">
              <span className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Removed Tables</span>
              {comparing.diff?.removedTables?.length ? (
                comparing.diff.removedTables.map((t, idx) => <div key={idx} className="font-mono text-red-300">- {t}</div>)
              ) : (
                <div className="text-gray-500">None</div>
              )}
            </div>

            <div className="p-3 bg-[#0b0f17] border border-amber-800/40 rounded-lg space-y-1">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Modified Tables</span>
              {comparing.diff?.modifiedTables?.length ? (
                comparing.diff.modifiedTables.map((m, idx) => (
                  <div key={idx} className="font-mono text-amber-300">{m.tableName}</div>
                ))
              ) : (
                <div className="text-gray-500">None</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version List */}
      <div className="space-y-3">
        {versionList.map((ver, idx) => (
          <div key={idx} className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-base text-white">Version {ver.version_number}</span>
                <span className="text-xs text-gray-400 font-mono">
                  {new Date(ver.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {idx < versionList.length - 1 && (
                <button
                  onClick={() => handleCompare(versionList[idx + 1].version_number, ver.version_number)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium flex items-center space-x-1 transition"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare Diff</span>
                </button>
              )}
              <button
                onClick={() => handleRestore(ver.version_number)}
                disabled={isLoading}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center space-x-1 transition shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Version</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
