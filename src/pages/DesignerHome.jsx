import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import NewProjectModal from '../components/database/NewProjectModal';
import { projectApi, databaseApi, ensureDemoAuth } from '../api/client';
import { Plus, Database, Sparkles, FolderKanban, Copy, Trash2, Edit2, ArrowRight, Clock } from 'lucide-react';

export default function DesignerHome() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dbFilter, setDbFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('updated');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await ensureDemoAuth();
      const res = await projectApi.getProjects();
      setProjects(res.projects || []);
    } catch (err) {
      console.error('Failed to load database projects:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (data) => {
    setIsCreating(true);
    try {
      await ensureDemoAuth();
      const res = await databaseApi.analyzeRequirement(data);
      if (res.projectId) {
        navigate(`/database-designer/${res.projectId}`);
      }
    } catch (err) {
      alert(`Failed to analyze requirement: ${err.message}`);
    } finally {
      setIsCreating(false);
      setIsModalOpen(false);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      await projectApi.duplicateProject(id);
      loadData();
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this database design project?')) return;
    try {
      await projectApi.deleteProject(id);
      loadData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleRename = async (proj, e) => {
    e.stopPropagation();
    const newName = window.prompt('Enter new project name:', proj.name);
    if (!newName || !newName.trim()) return;
    try {
      await projectApi.updateProject(proj.id, { name: newName.trim() });
      loadData();
    } catch (err) {
      alert(`Rename failed: ${err.message}`);
    }
  };

  // Filter and Sort Projects
  const filteredProjects = projects
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
      const matchFilter = dbFilter === 'ALL' || (p.database_type || 'PostgreSQL').toUpperCase() === dbFilter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created') return new Date(b.created_at) - new Date(a.created_at);
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  return (
    <AppLayout title="AI Database Designer" search={search} onSearchChange={setSearch}>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-indigo-950/60 via-[#111827] to-[#111827] border border-indigo-800/40 rounded-2xl p-6 shadow-xl gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>DevForge AI Module 1</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Database Designer</h1>
            <p className="text-xs text-gray-400 mt-1">Transform natural-language requirements into production-ready database designs.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Database Design</span>
          </button>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-3 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-medium">Filter DB Dialect:</span>
            {['ALL', 'POSTGRESQL', 'MYSQL', 'SQLITE', 'MONGODB'].map((f) => (
              <button
                key={f}
                onClick={() => setDbFilter(f)}
                className={`px-3 py-1 rounded-lg font-mono font-medium transition ${
                  dbFilter === f
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-[#1f2937] text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 bg-[#1f2937] border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name</option>
              <option value="created">Created Date</option>
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading database designs...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-16 text-center">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No database designs yet</h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">Create your first AI Database Design project from natural-language requirements.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium inline-flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Database</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/database-designer/${proj.id}`)}
                className="bg-[#111827] border border-gray-800 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-sm hover:shadow-xl space-y-4 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-800/60 font-mono text-[10px] uppercase font-bold">
                      {proj.database_type || 'PostgreSQL'}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center space-x-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(proj.updated_at).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-gray-400 font-mono text-[11px]">
                    <span><strong>{proj.entity_count || proj.table_count || 0}</strong> Entities</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleRename(proj, e)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
                      title="Rename Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(proj.id, e)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={isCreating}
      />
    </AppLayout>
  );
}
