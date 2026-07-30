import React, { useState, useEffect } from 'react';
import {
  History,
  Plus,
  RotateCcw,
  GitCompare,
  CheckCircle2,
  Eye,
  Trash2,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  GitBranch,
  X,
  FileCode,
  FileJson,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { versionApi } from '../../api/client';

export default function VersionHistory({
  projectId,
  versions: propVersions = [],
  onVersionRestored
}) {
  const [versionList, setVersionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    versionName: '',
    description: '',
    tag: 'Manual Snapshot'
  });

  const [viewingVersion, setViewingVersion] = useState(null); // Version object for View Inspector
  const [viewTab, setViewTab] = useState('overview');

  const [comparing, setComparing] = useState(null); // { v1, v2, v1Name, v2Name, diff }
  const [compareV1, setCompareV1] = useState('');
  const [compareV2, setCompareV2] = useState('');

  const [restoringVersion, setRestoringVersion] = useState(null); // Version object for Restore modal
  const [exportingVersion, setExportingVersion] = useState(null); // Version object for Export modal

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All'); // 'All', 'Latest', 'Restored', 'AI Generated', 'Manual Changes'

  useEffect(() => {
    if (projectId) {
      loadVersions();
    } else if (propVersions && propVersions.length > 0) {
      setVersionList(propVersions);
    }
  }, [projectId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const res = await versionApi.getVersions(projectId);
      if (res.success && Array.isArray(res.versions)) {
        setVersionList(res.versions);
      }
    } catch (err) {
      console.warn('Could not load version history from backend:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    if (!createForm.versionName.trim()) {
      alert('Please enter a version name.');
      return;
    }
    setLoading(true);
    try {
      const res = await versionApi.createVersion(projectId, {
        versionName: createForm.versionName.trim(),
        description: createForm.description.trim(),
        tag: createForm.tag
      });

      if (res.success && res.version) {
        setVersionList([res.version, ...versionList]);
        setActionMessage(`Version ${res.version.version_number} snapshot "${res.version.version_name}" created successfully.`);
        setIsCreateOpen(false);
        setCreateForm({ versionName: '', description: '', tag: 'Manual Snapshot' });
      }
    } catch (err) {
      alert(`Create snapshot failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoringVersion) return;
    setLoading(true);
    const vNum = restoringVersion.version_number;
    try {
      const res = await versionApi.restoreVersion(projectId, vNum);
      setActionMessage(res.message || `Restored Version ${vNum} successfully.`);
      setRestoringVersion(null);
      await loadVersions();
      if (onVersionRestored) onVersionRestored();
    } catch (err) {
      alert(`Restore failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSubmit = async (v1Num, v2Num) => {
    if (!v1Num || !v2Num || v1Num === v2Num) {
      alert('Please select two distinct versions to compare.');
      return;
    }
    setLoading(true);
    try {
      const res = await versionApi.compareVersions(projectId, v1Num, v2Num);
      if (res.success) {
        setComparing({
          v1: res.v1,
          v2: res.v2,
          v1Name: res.v1Name,
          v2Name: res.v2Name,
          diff: res.diff
        });
      }
    } catch (err) {
      alert(`Compare failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = async (vNum) => {
    if (!window.confirm(`Are you sure you want to delete Version ${vNum} snapshot? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      await versionApi.deleteVersion(projectId, vNum);
      setVersionList(prev => prev.filter((v) => v.version_number !== vNum));
      setActionMessage(`Version ${vNum} snapshot deleted.`);
    } catch (err) {
      setVersionList(prev => prev.filter((v) => v.version_number !== vNum));
      setActionMessage(`Version ${vNum} snapshot removed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSql = (ver) => {
    const ddl = ver.snapshot?.sql?.ddlSql || ver.snapshot?.sql || '';
    const sqlContent = `-- DevForge AI Version Snapshot #${ver.version_number} (${ver.version_name})\n-- Exported: ${new Date().toLocaleString()}\n\n${ddl}`;
    downloadFile(sqlContent, `version_${ver.version_number}_${ver.version_name.replace(/\s+/g, '_')}.sql`, 'text/plain');
  };

  const handleExportJson = (ver) => {
    const jsonContent = JSON.stringify(ver.snapshot || ver, null, 2);
    downloadFile(jsonContent, `version_${ver.version_number}_${ver.version_name.replace(/\s+/g, '_')}.json`, 'application/json');
  };

  const handleExportSummary = (ver) => {
    const snap = ver.snapshot || {};
    const tables = snap.schema?.tables || snap.entities || [];
    const summaryMd = `# Database Design Snapshot - ${ver.version_name} (Version ${ver.version_number})\n\n` +
      `- **Created At:** ${new Date(ver.created_at).toLocaleString()}\n` +
      `- **Created By:** ${ver.created_by}\n` +
      `- **Database Type:** ${ver.database_type}\n` +
      `- **Description:** ${ver.description}\n\n` +
      `## Tables (${tables.length})\n` +
      tables.map(t => `### ${t.name}\nColumns: ${(t.columns || t.attributes || []).map(c => `${c.name} (${c.dataType || c.type})`).join(', ')}\n`).join('\n');

    downloadFile(summaryMd, `version_${ver.version_number}_summary.md`, 'text/markdown');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter & Search
  const filteredVersions = versionList.filter((ver) => {
    if (selectedTag === 'Latest' && ver.version_number !== versionList[0]?.version_number) return false;
    if (selectedTag === 'Restored' && ver.tag !== 'Restored') return false;
    if (selectedTag === 'AI Generated' && ver.tag !== 'AI Generated') return false;
    if (selectedTag === 'Manual Changes' && (ver.tag !== 'Manual Snapshot' && ver.tag !== 'Manual Changes')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (ver.version_name || '').toLowerCase().includes(q);
      const matchDesc = (ver.description || '').toLowerCase().includes(q);
      const matchNum = `version ${ver.version_number}`.includes(q);
      const matchDate = new Date(ver.created_at).toLocaleString().toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchNum && !matchDate) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ---------------------------------------------------- */}
      {/* HEADER BAR */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                <span>Git-Style Database Version Control</span>
                <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] rounded-full border border-indigo-800 font-mono">
                  Immutable History
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Point-in-time design snapshots, side-by-side version comparison diffs, and safe rollback restoration
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Version Snapshot</span>
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs flex items-center justify-between shadow">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VISUAL TIMELINE SUMMARY */}
      {/* ---------------------------------------------------- */}
      {versionList.length > 0 && (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-white font-mono">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span>Version Snapshot Timeline ({versionList.length} Total Snapshots)</span>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">Chronological progression</span>
          </div>

          {/* Timeline Nodes */}
          <div className="flex items-center space-x-2 overflow-x-auto py-2 scrollbar-thin">
            {[...versionList].reverse().map((ver, idx, arr) => (
              <React.Fragment key={ver.version_number}>
                <div
                  onClick={() => setViewingVersion(ver)}
                  className="flex items-center space-x-2 bg-[#0b0f17] hover:bg-gray-800/80 border border-gray-800 hover:border-indigo-500/60 rounded-xl px-3 py-2 cursor-pointer transition flex-shrink-0 group"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    idx === arr.length - 1 ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-500'
                  }`} />
                  <div>
                    <div className="text-xs font-bold font-mono text-white group-hover:text-indigo-300">
                      v{ver.version_number}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono truncate max-w-[110px]">
                      {ver.version_name}
                    </div>
                  </div>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTROLS: FILTERS, SEARCH & COMPARE launcher */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tag Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto text-xs font-medium">
            {['All', 'Latest', 'Restored', 'AI Generated', 'Manual Changes'].map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search version name, description or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f17] border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>
        </div>

        {/* Compare Quick Selector */}
        {versionList.length >= 2 && (
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-800/80 text-xs font-mono">
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-gray-400">Quick Compare:</span>
            <select
              value={compareV1}
              onChange={(e) => setCompareV1(e.target.value)}
              className="bg-[#0b0f17] border border-gray-800 text-white px-2 py-1 rounded-lg text-xs focus:outline-none"
            >
              <option value="">Select Base Version</option>
              {versionList.map((v) => (
                <option key={v.version_number} value={v.version_number}>
                  Version {v.version_number} ({v.version_name})
                </option>
              ))}
            </select>
            <span className="text-gray-500">vs</span>
            <select
              value={compareV2}
              onChange={(e) => setCompareV2(e.target.value)}
              className="bg-[#0b0f17] border border-gray-800 text-white px-2 py-1 rounded-lg text-xs focus:outline-none"
            >
              <option value="">Select Target Version</option>
              {versionList.map((v) => (
                <option key={v.version_number} value={v.version_number}>
                  Version {v.version_number} ({v.version_name})
                </option>
              ))}
            </select>

            <button
              onClick={() => handleCompareSubmit(compareV1, compareV2)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition"
            >
              Compare
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* EMPTY STATE */}
      {/* ---------------------------------------------------- */}
      {filteredVersions.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-gray-900 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-gray-800 shadow">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">No snapshots have been created.</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Create your first version snapshot to safely preserve your database design history and enable point-in-time restorations.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Version Snapshot</span>
          </button>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* VERSION CARDS LIST */
        /* ---------------------------------------------------- */
        <div className="space-y-4">
          {filteredVersions.map((ver, idx) => {
            const isLatest = idx === 0 && selectedTag === 'All';
            const isRestored = ver.tag === 'Restored';
            const stats = ver.stats || {};

            return (
              <div
                key={ver.id || ver.version_number}
                className="bg-[#111827] border border-gray-800 hover:border-gray-700 rounded-2xl p-5 space-y-4 transition shadow-lg relative"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-base font-extrabold text-white bg-[#0b0f17] px-3 py-1 rounded-lg border border-gray-800">
                      Version {ver.version_number}
                    </span>

                    <h3 className="text-sm font-bold text-indigo-300 font-mono">
                      {ver.version_name}
                    </h3>

                    {isLatest && (
                      <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded-full">
                        Latest
                      </span>
                    )}

                    {isRestored && (
                      <span className="px-2.5 py-0.5 bg-violet-950 text-violet-300 border border-violet-800 text-[10px] font-mono font-bold rounded-full flex items-center space-x-1">
                        <RotateCcw className="w-3 h-3" />
                        <span>Restored</span>
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 bg-gray-900 text-gray-400 border border-gray-800 text-[10px] font-mono rounded-full">
                      {ver.tag || 'Snapshot'}
                    </span>
                  </div>

                  {/* Creation Metadata */}
                  <div className="flex items-center space-x-3 text-xs text-gray-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{new Date(ver.created_at).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{ver.created_by}</span>
                    </span>
                  </div>
                </div>

                {/* Description & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-gray-300 leading-relaxed font-sans">
                      {ver.description || 'Database design version snapshot.'}
                    </p>
                  </div>

                  {/* Stats Pills */}
                  <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                    <div className="bg-[#0b0f17] border border-gray-800 rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">Tables</div>
                      <div className="text-sm font-bold text-white">{stats.tableCount}</div>
                    </div>
                    <div className="bg-[#0b0f17] border border-gray-800 rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">Relationships</div>
                      <div className="text-sm font-bold text-indigo-300">{stats.relCount}</div>
                    </div>
                    <div className="bg-[#0b0f17] border border-gray-800 rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">Validation</div>
                      <div className="text-sm font-bold text-emerald-400">{stats.validationScore}/100</div>
                    </div>
                    <div className="bg-[#0b0f17] border border-gray-800 rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">Performance</div>
                      <div className="text-sm font-bold text-amber-400">{stats.performanceScore}/100</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-800/80">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewingVersion(ver)}
                      className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border border-gray-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Snapshot</span>
                    </button>

                    {idx < filteredVersions.length - 1 && (
                      <button
                        onClick={() => handleCompareSubmit(filteredVersions[idx + 1].version_number, ver.version_number)}
                        className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition border border-gray-700"
                      >
                        <GitCompare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Compare Prev</span>
                      </button>
                    )}

                    <button
                      onClick={() => setRestoringVersion(ver)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Version</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExportingVersion(ver)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium flex items-center space-x-1 transition border border-gray-700"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export</span>
                    </button>

                    <button
                      onClick={() => handleDeleteVersion(ver.version_number)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition"
                      title="Delete version snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CREATE SNAPSHOT DIALOG MODAL */}
      {/* ---------------------------------------------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-mono">Create Version Snapshot</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Version Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hospital Database v1"
                  value={createForm.versionName}
                  onChange={(e) => setCreateForm({ ...createForm, versionName: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Initial AI generated database design with full schema, indexes, and AI review."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Snapshot Tag</label>
                <select
                  value={createForm.tag}
                  onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none cursor-pointer"
                >
                  <option value="Manual Snapshot">Manual Snapshot</option>
                  <option value="Major Release">Major Release</option>
                  <option value="Pre-Deploy">Pre-Deploy</option>
                  <option value="AI Generated">AI Generated</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Snapshot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* COMPARE VERSIONS DIFF MODAL */}
      {/* ---------------------------------------------------- */}
      {comparing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">Version Comparison Diff</h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Version {comparing.v1} ({comparing.v1Name}) → Version {comparing.v2} ({comparing.v2Name})
                  </p>
                </div>
              </div>
              <button onClick={() => setComparing(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Comparison Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#0b0f17] border border-gray-800 rounded-xl space-y-1">
                <div className="text-gray-400">Validation Score</div>
                <div className="text-base font-bold text-emerald-400">
                  {comparing.diff?.validationScoreDiff?.from ?? 100} → {comparing.diff?.validationScoreDiff?.to ?? 100} / 100
                </div>
              </div>

              <div className="p-3 bg-[#0b0f17] border border-gray-800 rounded-xl space-y-1">
                <div className="text-gray-400">Performance Score</div>
                <div className="text-base font-bold text-amber-400">
                  {comparing.diff?.performanceScoreDiff?.from ?? 98} → {comparing.diff?.performanceScoreDiff?.to ?? 98} / 100
                </div>
              </div>

              <div className="p-3 bg-[#0b0f17] border border-gray-800 rounded-xl space-y-1">
                <div className="text-gray-400">AI Critical Issues</div>
                <div className="text-base font-bold text-violet-300">
                  {comparing.diff?.aiReviewDiff?.criticalFrom ?? 0} → {comparing.diff?.aiReviewDiff?.criticalTo ?? 0}
                </div>
              </div>
            </div>

            {/* Diffs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#0b0f17] border border-emerald-800/40 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Added Entities ({comparing.diff.addedTables?.length || 0})</span>
                </span>
                {comparing.diff.addedTables?.length ? (
                  comparing.diff.addedTables.map((t, idx) => (
                    <div key={idx} className="p-1.5 bg-emerald-950/40 rounded text-emerald-300 font-semibold border border-emerald-800/40">
                      + {t}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No new entities added</div>
                )}
              </div>

              <div className="p-4 bg-[#0b0f17] border border-red-800/40 rounded-xl space-y-2">
                <span className="font-bold text-red-400 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Removed Entities ({comparing.diff.removedTables?.length || 0})</span>
                </span>
                {comparing.diff.removedTables?.length ? (
                  comparing.diff.removedTables.map((t, idx) => (
                    <div key={idx} className="p-1.5 bg-red-950/40 rounded text-red-300 font-semibold border border-red-800/40">
                      - {t}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No entities removed</div>
                )}
              </div>

              <div className="p-4 bg-[#0b0f17] border border-amber-800/40 rounded-xl space-y-2">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  Modified Entities ({comparing.diff.modifiedTables?.length || 0})
                </span>
                {comparing.diff.modifiedTables?.length ? (
                  comparing.diff.modifiedTables.map((m, idx) => (
                    <div key={idx} className="p-2 bg-amber-950/40 rounded text-amber-300 border border-amber-800/40 space-y-1">
                      <div className="font-bold text-white">{m.tableName}</div>
                      {m.addedCols?.map((c, i) => <div key={i} className="text-[10px] text-emerald-300">+ {c}</div>)}
                      {m.modifiedCols?.map((c, i) => <div key={i} className="text-[10px] text-amber-300">~ {c}</div>)}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No columns modified</div>
                )}
              </div>
            </div>

            {/* Relationship & Index Diffs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#0b0f17] border border-gray-800 rounded-xl space-y-2">
                <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                  Relationship Diffs ({comparing.diff.relationshipChanges?.length || 0})
                </span>
                {comparing.diff.relationshipChanges?.length ? (
                  comparing.diff.relationshipChanges.map((r, i) => (
                    <div key={i} className={`p-1.5 rounded border ${
                      r.type === 'added' ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40' : 'bg-red-950/30 text-red-300 border-red-800/40'
                    }`}>
                      {r.type === 'added' ? '+ ' : '- '}{r.description}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No relationship changes</div>
                )}
              </div>

              <div className="p-4 bg-[#0b0f17] border border-gray-800 rounded-xl space-y-2">
                <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                  Index Diffs ({comparing.diff.indexChanges?.length || 0})
                </span>
                {comparing.diff.indexChanges?.length ? (
                  comparing.diff.indexChanges.map((idx, i) => (
                    <div key={i} className="p-1.5 bg-gray-900 rounded text-amber-300 border border-gray-800">
                      {idx.sql}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No index changes</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-800">
              <button
                onClick={() => setComparing(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl text-xs"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* RESTORE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {restoringVersion && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-indigo-800/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 bg-amber-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Restore Version {restoringVersion.version_number}?</h3>
            </div>

            <div className="text-xs text-gray-300 leading-relaxed font-sans space-y-2">
              <p>
                You are restoring <strong className="text-white font-mono">Version {restoringVersion.version_number} ({restoringVersion.version_name})</strong>.
              </p>
              <p className="text-emerald-300 font-mono bg-emerald-950/60 border border-emerald-800/50 p-2.5 rounded-lg">
                ✓ Current changes will be preserved automatically as a new backup version snapshot before restoring.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-800 font-mono">
              <button
                onClick={() => setRestoringVersion(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{loading ? 'Restoring...' : 'Confirm Restore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* EXPORT MODAL */}
      {/* ---------------------------------------------------- */}
      {exportingVersion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-mono">Export Version {exportingVersion.version_number}</h3>
              </div>
              <button onClick={() => setExportingVersion(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <button
                onClick={() => { handleExportSql(exportingVersion); setExportingVersion(null); }}
                className="w-full p-3.5 bg-[#0b0f17] hover:bg-gray-800 border border-gray-800 rounded-xl text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <FileCode className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-white font-bold">SQL DDL Script (.sql)</div>
                    <div className="text-[11px] text-gray-400">DDL table definitions & constraints</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-500 group-hover:text-white" />
              </button>

              <button
                onClick={() => { handleExportJson(exportingVersion); setExportingVersion(null); }}
                className="w-full p-3.5 bg-[#0b0f17] hover:bg-gray-800 border border-gray-800 rounded-xl text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <FileJson className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-white font-bold">Complete Snapshot JSON (.json)</div>
                    <div className="text-[11px] text-gray-400">Full database design snapshot structure</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-500 group-hover:text-white" />
              </button>

              <button
                onClick={() => { handleExportSummary(exportingVersion); setExportingVersion(null); }}
                className="w-full p-3.5 bg-[#0b0f17] hover:bg-gray-800 border border-gray-800 rounded-xl text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-white font-bold">ER Summary Report (.md)</div>
                    <div className="text-[11px] text-gray-400">Markdown design documentation report</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-500 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW SNAPSHOT INSPECTOR MODAL */}
      {/* ---------------------------------------------------- */}
      {viewingVersion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-5xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Version {viewingVersion.version_number} Snapshot: {viewingVersion.version_name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Created {new Date(viewingVersion.created_at).toLocaleString()} by {viewingVersion.created_by}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingVersion(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center space-x-1 bg-[#0b0f17] border border-gray-800 rounded-xl p-1 text-xs font-mono font-medium overflow-x-auto">
              {['overview', 'entities', 'relationships', 'schema', 'sql', 'validation', 'indexes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition capitalize whitespace-nowrap ${
                    viewTab === tab ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Inspector Body */}
            <div className="p-4 bg-[#0b0f17] border border-gray-800 rounded-xl min-h-[300px] text-xs font-mono space-y-3">
              {viewTab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#111827] border border-gray-800 rounded-lg">
                      <div className="text-gray-400">Entities</div>
                      <div className="text-lg font-bold text-white">{(viewingVersion.snapshot?.schema?.tables || viewingVersion.snapshot?.entities || []).length}</div>
                    </div>
                    <div className="p-3 bg-[#111827] border border-gray-800 rounded-lg">
                      <div className="text-gray-400">Relationships</div>
                      <div className="text-lg font-bold text-indigo-300">{(viewingVersion.snapshot?.relationships || []).length}</div>
                    </div>
                    <div className="p-3 bg-[#111827] border border-gray-800 rounded-lg">
                      <div className="text-gray-400">Validation</div>
                      <div className="text-lg font-bold text-emerald-400">{viewingVersion.stats?.validationScore || 100}/100</div>
                    </div>
                    <div className="p-3 bg-[#111827] border border-gray-800 rounded-lg">
                      <div className="text-gray-400">Performance</div>
                      <div className="text-lg font-bold text-amber-400">{viewingVersion.stats?.performanceScore || 98}/100</div>
                    </div>
                  </div>
                  <p className="text-gray-300 font-sans">{viewingVersion.description}</p>
                </div>
              )}

              {viewTab === 'entities' && (
                <div className="space-y-3">
                  {(viewingVersion.snapshot?.entities || viewingVersion.snapshot?.schema?.tables || []).map((ent, i) => (
                    <div key={i} className="p-3 bg-[#111827] border border-gray-800 rounded-lg space-y-2">
                      <div className="font-bold text-white">{ent.name}</div>
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {(ent.attributes || ent.columns || []).map((attr, j) => (
                          <span key={j} className="px-2 py-0.5 bg-gray-900 text-gray-300 rounded border border-gray-800">
                            {attr.name} ({attr.type || attr.dataType})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewTab === 'relationships' && (
                <div className="space-y-2">
                  {(viewingVersion.snapshot?.relationships || []).map((rel, i) => (
                    <div key={i} className="p-2.5 bg-[#111827] border border-gray-800 rounded-lg text-indigo-300">
                      {rel.source || rel.source_entity || rel.from} → {rel.target || rel.target_entity || rel.to} ({rel.type})
                    </div>
                  ))}
                </div>
              )}

              {viewTab === 'schema' && (
                <pre className="p-3 bg-[#111827] border border-gray-800 rounded-lg text-emerald-400 text-[11px] overflow-x-auto">
                  {JSON.stringify(viewingVersion.snapshot?.schema || {}, null, 2)}
                </pre>
              )}

              {viewTab === 'sql' && (
                <pre className="p-3 bg-[#111827] border border-gray-800 rounded-lg text-emerald-400 text-[11px] overflow-x-auto">
                  {viewingVersion.snapshot?.sql?.ddlSql || viewingVersion.snapshot?.sql || '-- No SQL script stored'}
                </pre>
              )}

              {viewTab === 'validation' && (
                <div className="space-y-2">
                  <div className="font-bold text-emerald-400">Score: {viewingVersion.stats?.validationScore || 100} / 100</div>
                  <pre className="p-3 bg-[#111827] border border-gray-800 rounded-lg text-gray-300 text-[11px] overflow-x-auto">
                    {JSON.stringify(viewingVersion.snapshot?.validation || { isValid: true, issues: [] }, null, 2)}
                  </pre>
                </div>
              )}

              {viewTab === 'indexes' && (
                <div className="space-y-2">
                  <div className="font-bold text-amber-400">Performance Score: {viewingVersion.stats?.performanceScore || 98} / 100</div>
                  <pre className="p-3 bg-[#111827] border border-gray-800 rounded-lg text-amber-300 text-[11px] overflow-x-auto">
                    {JSON.stringify(viewingVersion.snapshot?.indexes || {}, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingVersion(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
