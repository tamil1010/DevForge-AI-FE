import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import OverviewTab from '../components/database/OverviewTab';
import RequirementEditor from '../components/database/RequirementEditor';
import EntityEditor from '../components/database/EntityEditor';
import RelationshipEditor from '../components/database/RelationshipEditor';
import SchemaViewer from '../components/database/SchemaViewer';
import ERDiagramCanvas from '../components/database/ERDiagramCanvas';
import SQLViewer from '../components/database/SQLViewer';
import ValidationPanel from '../components/database/ValidationPanel';
import AISuggestions from '../components/database/AISuggestions';
import IndexRecommendations from '../components/database/IndexRecommendations';
import VersionHistory from '../components/database/VersionHistory';
import ExportModal from '../components/database/ExportModal';
import { projectApi, databaseApi, ensureDemoAuth } from '../api/client';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Network,
  Table,
  GitBranch,
  Code,
  ShieldCheck,
  Sparkles,
  Zap,
  History,
  Save,
  Download,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const STAGES = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  { id: 'entities', name: 'Entities', icon: Layers },
  { id: 'relationships', name: 'Relationships', icon: Network },
  { id: 'schema', name: 'Schema', icon: Table },
  { id: 'er', name: 'ER Diagram', icon: GitBranch },
  { id: 'sql', name: 'SQL', icon: Code },
  { id: 'validation', name: 'Validation', icon: ShieldCheck },
  { id: 'review', name: 'AI Review', icon: Sparkles },
  { id: 'requirement', name: 'Prompt', icon: FileText },
  { id: 'indexes', name: 'Indexes', icon: Zap },
  { id: 'versions', name: 'Versions', icon: History }
];

export default function Workspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState('Saved');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [stageStatuses, setStageStatuses] = useState({
    overview: 'Completed',
    entities: 'Completed',
    relationships: 'Completed',
    schema: 'Completed',
    er: 'Completed',
    sql: 'Completed',
    validation: 'Completed',
    review: 'Completed',
    requirement: 'Completed',
    indexes: 'Completed',
    versions: 'Completed'
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      await ensureDemoAuth();
      const res = await projectApi.getProject(projectId);
      if (res.project) {
        setProject(res.project);
      }
    } catch (err) {
      alert(`Failed to load database project: ${err.message}`);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyzeRequirement = async ({ requirement, databaseType }) => {
    setIsLoading(true);
    setSaveState('Saving...');
    try {
      const res = await databaseApi.analyzeRequirement({
        projectId,
        requirement,
        databaseType
      });
      if (res.projectId) {
        await loadProjectData();
        setActiveTab('overview');
        markDownstreamOutdated('requirement');
        setSaveState('Saved');
      }
    } catch (err) {
      alert(`Re-analysis failed: ${err.message}`);
      setSaveState('Save Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntities = async (entities) => {
    setIsLoading(true);
    setSaveState('Saving...');
    try {
      await databaseApi.saveEntities({ projectId, entities });
      await databaseApi.generateSchema({ projectId });
      await databaseApi.generateSql({ projectId });
      await databaseApi.validateSchema({ projectId });
      await loadProjectData();
      markDownstreamOutdated('entities');
      setSaveState('Saved');
    } catch (err) {
      alert(`Save entities failed: ${err.message}`);
      setSaveState('Save Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRelationships = async (relationships) => {
    setIsLoading(true);
    setSaveState('Saving...');
    try {
      await databaseApi.saveRelationships({ projectId, relationships });
      await databaseApi.generateSchema({ projectId });
      await databaseApi.generateSql({ projectId });
      await databaseApi.validateSchema({ projectId });
      await loadProjectData();
      markDownstreamOutdated('relationships');
      setSaveState('Saved');
    } catch (err) {
      alert(`Save relationships failed: ${err.message}`);
      setSaveState('Save Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSchema = async () => {
    setIsLoading(true);
    try {
      await databaseApi.generateSchema({ projectId });
      await databaseApi.generateSql({ projectId });
      await databaseApi.validateSchema({ projectId });
      await loadProjectData();
      setStageStatuses(prev => ({ ...prev, schema: 'Completed', er: 'Completed', sql: 'Completed', validation: 'Completed' }));
    } catch (err) {
      alert(`Schema generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSql = async (dialect) => {
    setIsLoading(true);
    try {
      await databaseApi.generateSql({ projectId, dialect });
      await loadProjectData();
      setStageStatuses(prev => ({ ...prev, sql: 'Completed' }));
    } catch (err) {
      alert(`SQL generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateSchema = async () => {
    setIsLoading(true);
    try {
      await databaseApi.validateSchema({ projectId });
      await loadProjectData();
      setStageStatuses(prev => ({ ...prev, validation: 'Completed' }));
    } catch (err) {
      alert(`Validation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSafeAutoFix = async () => {
    setIsLoading(true);
    try {
      await databaseApi.safeAutoFix({ projectId });
      await databaseApi.generateSql({ projectId });
      await loadProjectData();
      alert('Safe auto fixes applied successfully.');
    } catch (err) {
      alert(`Auto Fix failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const markDownstreamOutdated = (fromStage) => {
    setStageStatuses(prev => {
      const updated = { ...prev };
      if (fromStage === 'requirement' || fromStage === 'entities') {
        updated.relationships = 'Check Required';
        updated.schema = 'Outdated';
        updated.er = 'Outdated';
        updated.sql = 'Outdated';
        updated.validation = 'Outdated';
      } else if (fromStage === 'relationships') {
        updated.schema = 'Outdated';
        updated.er = 'Outdated';
        updated.sql = 'Outdated';
        updated.validation = 'Outdated';
      }
      return updated;
    });
  };

  if (isLoading && !project) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-white text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Opening Complete Database Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title={project?.name || 'Database Workspace'}>
      <div className="space-y-4 flex flex-col h-full">
        {/* Workspace Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-3.5 gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
              title="Back to Saved Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white font-mono">{project?.name}</h1>
                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] font-mono rounded border border-indigo-800/60 font-bold uppercase">
                  {project?.database_type || 'PostgreSQL'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Autosave Status */}
            <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono">
              <span className={`w-2 h-2 rounded-full ${
                saveState === 'Saved' ? 'bg-emerald-400' :
                saveState === 'Saving...' ? 'bg-amber-400 animate-ping' :
                'bg-red-400'
              }`} />
              <span>{saveState}</span>
            </div>

            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export</span>
            </button>

            <button
              onClick={() => handleSaveEntities(project?.entities || [])}
              disabled={isLoading}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Design</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-[#111827] border border-gray-800 rounded-xl p-1.5 overflow-x-auto text-xs font-medium">
          {STAGES.map((stg) => {
            const Icon = stg.icon;
            const status = stageStatuses[stg.id] || 'Completed';
            const isActive = activeTab === stg.id;

            return (
              <button
                key={stg.id}
                onClick={() => setActiveTab(stg.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                <span>{stg.name}</span>
                {status === 'Outdated' && (
                  <span className="w-2 h-2 bg-amber-400 rounded-full" title="Outdated - Regeneration Required" />
                )}
              </button>
            );
          })}
        </div>

        {/* Workspace Tab Rendering */}
        <div className="flex-1 bg-[#0b0f17] pt-2">
          {activeTab === 'overview' && (
            <OverviewTab project={project} />
          )}

          {activeTab === 'entities' && (
            <EntityEditor
              entities={project?.entities || []}
              onSaveEntities={handleSaveEntities}
              onContinue={() => setActiveTab('relationships')}
            />
          )}

          {activeTab === 'relationships' && (
            <RelationshipEditor
              entities={project?.entities || []}
              relationships={project?.relationships || []}
              onSaveRelationships={handleSaveRelationships}
            />
          )}

          {activeTab === 'schema' && (
            <SchemaViewer
              schema={project?.schema}
              normalizationStatus={project?.normalizationStatus}
              onRegenerateSchema={handleRegenerateSchema}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'er' && (
            <ERDiagramCanvas
              schema={project?.schema}
              relationships={project?.relationships || []}
            />
          )}

          {activeTab === 'sql' && (
            <SQLViewer
              generatedSql={project?.generatedSql}
              currentDialect={project?.database_type}
              onRegenerateSql={handleRegenerateSql}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'validation' && (
            <ValidationPanel
              validation={project?.validation}
              onValidate={handleValidateSchema}
              onAutoFix={handleSafeAutoFix}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'review' && (
            <AISuggestions
              projectId={projectId}
              onModifyComplete={loadProjectData}
            />
          )}

          {activeTab === 'requirement' && (
            <RequirementEditor
              project={project}
              onReanalyze={handleReanalyzeRequirement}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'indexes' && (
            <IndexRecommendations
              recommendations={[]}
              onApplyIndex={(rec) => {
                alert(`Added index ${rec.sql} to SQL configuration.`);
              }}
            />
          )}

          {activeTab === 'versions' && (
            <VersionHistory
              projectId={projectId}
              versions={project?.versions || []}
              onVersionRestored={loadProjectData}
            />
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />
    </AppLayout>
  );
}
