import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { projectApi, codeProjectApi } from '../api/client';
import {
  Code2,
  Search,
  Sparkles,
  Layers,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  Database,
  RefreshCw,
  X,
  Play
} from 'lucide-react';

export default function AiCodeHome() {
  const navigate = useNavigate();

  // State
  const [dbProjects, setDbProjects] = useState([]);
  const [codeProjects, setCodeProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialect, setFilterDialect] = useState('ALL');

  // Stack Selection Modal State
  const [selectedDbProject, setSelectedDbProject] = useState(null);
  const [showStackModal, setShowStackModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [stackForm, setStackForm] = useState({
    programming_language: 'JavaScript',
    framework: 'Express.js',
    project_type: 'Full Stack'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dbRes, codeRes] = await Promise.all([
        projectApi.getProjects().catch(() => ({ projects: [] })),
        codeProjectApi.getProjects().catch(() => ({ data: [] }))
      ]);

      if (dbRes && dbRes.projects) setDbProjects(dbRes.projects);
      if (codeRes && codeRes.data) setCodeProjects(codeRes.data);
    } catch (err) {
      console.error('Failed to load database designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGenerateModal = (dbProj, e) => {
    if (e) e.stopPropagation();
    setSelectedDbProject(dbProj);
    setShowStackModal(true);
  };

  const handleGenerateCode = async () => {
    if (!selectedDbProject) return;
    setGenerating(true);
    try {
      const res = await codeProjectApi.generateForDbProject({
        db_project_id: selectedDbProject.id,
        programming_language: stackForm.programming_language,
        framework: stackForm.framework,
        project_type: stackForm.project_type
      });

      if (res.success && res.data) {
        setShowStackModal(false);
        navigate(`/ai-code/${res.data.id}`);
      }
    } catch (err) {
      console.error('Failed to generate application code:', err);
    } finally {
      setGenerating(false);
    }
  };

  const filteredDbProjects = dbProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const dialect = (p.database_type || 'POSTGRESQL').toUpperCase();
    const matchesDialect = filterDialect === 'ALL' || dialect.includes(filterDialect);
    return matchesSearch && matchesDialect;
  });

  return (
    <div className="flex h-screen bg-[#07090e] text-gray-200 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="AI CODE GENERATOR" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border border-purple-800/40 p-6 shadow-2xl">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-xs font-mono mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>DEPENDENT CODE GENERATION ENGINE</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Code Generator</h1>
                <p className="text-sm text-gray-400 max-w-2xl mt-1">
                  Generate production-ready full-stack software applications directly from your saved <strong className="text-white">AI Database Designer</strong> projects.
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d121d] p-4 rounded-xl border border-gray-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search database designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131926] border border-gray-700/60 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-gray-400 font-mono">Filter DB Dialect:</span>
              {['ALL', 'POSTGRESQL', 'MYSQL', 'SQLITE'].map(d => (
                <button
                  key={d}
                  onClick={() => setFilterDialect(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterDialect === d
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-[#131926] text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Database Designer Projects Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mb-3" />
              <span className="text-xs">Loading saved database designs...</span>
            </div>
          ) : filteredDbProjects.length === 0 ? (
            /* ZERO DB DESIGNS EMPTY STATE */
            <div className="bg-[#0d121d] border border-amber-800/40 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xl">
              <div className="p-4 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No Database Designs Available</h3>
              <p className="text-xs text-gray-400 mt-2 mb-6 leading-relaxed">
                AI Code generates application code directly from your existing AI Database Designer projects. Please create a database design first.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                <Database className="w-4 h-4" />
                <span>Open AI Database Designer</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDbProjects.map(dbProj => {
                const existingCodeProj = codeProjects.find(cp => String(cp.linked_db_project_id) === String(dbProj.id));
                const hasCode = !!existingCodeProj;

                return (
                  <div
                    key={dbProj.id}
                    onClick={() => {
                      if (hasCode) navigate(`/ai-code/${existingCodeProj.id}`);
                      else handleOpenGenerateModal(dbProj);
                    }}
                    className="group bg-[#0d121d] hover:bg-[#111726] border border-gray-800/80 hover:border-purple-500/50 rounded-xl p-5 transition duration-200 cursor-pointer flex flex-col justify-between shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:bg-purple-500/10 transition"></div>

                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg">
                          <Database className="w-5 h-5" />
                        </div>

                        {hasCode ? (
                          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Code Generated ✓</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-900 text-gray-400 border border-gray-800 rounded-full text-[10px] font-mono">
                            Code Not Generated
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">{dbProj.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1.5">{dbProj.description || 'Saved Database Design'}</p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 rounded text-[10px] font-mono font-bold uppercase">
                          {dbProj.database_type || 'PostgreSQL'}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-900 text-gray-400 border border-gray-800 rounded text-[10px] font-mono">
                          Source: AI Database Designer ✓
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-gray-400" />
                        <span><strong>{dbProj.entity_count || dbProj.table_count || 0}</strong> Entities</span>
                      </span>

                      {hasCode ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ai-code/${existingCodeProj.id}`);
                          }}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Open Code</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleOpenGenerateModal(dbProj, e)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center space-x-1 shadow-md shadow-purple-600/20 transition"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Generate Code</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Stack Selection Modal */}
      {showStackModal && selectedDbProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1422] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#111726]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg text-white">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Generate Application Code</h3>
                  <p className="text-[11px] text-gray-400">Select application technology stack</p>
                </div>
              </div>

              <button
                onClick={() => setShowStackModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Connected Database Summary Card */}
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{selectedDbProject.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Database: {selectedDbProject.database_type || 'PostgreSQL'} • Source: AI Database Designer ✓
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded text-[10px] font-mono font-bold">LOCKED</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Programming Language</label>
                  <select
                    value={stackForm.programming_language}
                    onChange={(e) => setStackForm({ ...stackForm, programming_language: e.target.value })}
                    className="w-full bg-[#141b2b] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Framework</label>
                  <select
                    value={stackForm.framework}
                    onChange={(e) => setStackForm({ ...stackForm, framework: e.target.value })}
                    className="w-full bg-[#141b2b] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Express.js">Express.js (Node.js)</option>
                    <option value="React">React</option>
                    <option value="Flask">Flask (Python)</option>
                    <option value="Spring Boot">Spring Boot (Java)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#111726] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowStackModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerateCode}
                disabled={generating}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Application Code...</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Generate Application Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
