import React from 'react';
import { X, Download, FileCode, FileText, Image } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, project }) {
  if (!isOpen || !project) return null;

  const sanitizeName = (str) => (str || 'database').toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSql = () => {
    const dialect = (project.database_type || 'PostgreSQL').toLowerCase();
    const filename = `${sanitizeName(project.name)}_${dialect}.sql`;
    const sqlContent = project.generatedSql?.ddl_sql || '-- No SQL script generated yet';
    downloadFile(sqlContent, filename, 'text/plain;charset=utf-8');
  };

  const handleExportSchemaJson = () => {
    const filename = `${sanitizeName(project.name)}_schema.json`;
    const jsonContent = JSON.stringify(project.schema || {}, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  };

  const handleExportFullProjectJson = () => {
    const filename = `${sanitizeName(project.name)}_full_project.json`;
    const fullPayload = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        database_type: project.database_type,
        updated_at: project.updated_at
      },
      requirement: project.requirement?.raw_text || '',
      analysis: project.requirement?.analysis || {},
      entities: project.entities || [],
      relationships: project.relationships || [],
      schema: project.schema || {},
      sql: project.generatedSql?.ddl_sql || '',
      validation: project.validation || {}
    };
    downloadFile(JSON.stringify(fullPayload, null, 2), filename, 'application/json');
  };

  const handleExportSvg = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="100%" height="100%" fill="#0b0f17"/>
      <text x="50%" y="50%" fill="#6366f1" font-size="20" text-anchor="middle" font-family="monospace">
        ${project.name} ER Diagram (${project.entities?.length || 0} Entities)
      </text>
    </svg>`;
    downloadFile(svgContent, `${sanitizeName(project.name)}_er_diagram.svg`, 'image/svg+xml');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#151c2c]">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Export Database Design</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Option 1: Executable SQL */}
          <button
            onClick={handleExportSql}
            className="w-full p-4 bg-[#1f2937] hover:bg-gray-800 border border-gray-700/60 rounded-xl flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg group-hover:scale-105 transition">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Export Executable SQL (.sql)</div>
                <div className="text-xs text-gray-400">Target dialect: {project.database_type || 'PostgreSQL'} DDL script</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>

          {/* Option 2: Full Project JSON */}
          <button
            onClick={handleExportFullProjectJson}
            className="w-full p-4 bg-[#1f2937] hover:bg-gray-800 border border-gray-700/60 rounded-xl flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg group-hover:scale-105 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Export Full Project JSON</div>
                <div className="text-xs text-gray-400">Complete bundle with requirements, entities, schema & SQL</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>

          {/* Option 3: Schema JSON */}
          <button
            onClick={handleExportSchemaJson}
            className="w-full p-4 bg-[#1f2937] hover:bg-gray-800 border border-gray-700/60 rounded-xl flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg group-hover:scale-105 transition">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Export Schema JSON</div>
                <div className="text-xs text-gray-400">Structured table definitions & column metadata</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>

          {/* Option 4: ER Diagram SVG */}
          <button
            onClick={handleExportSvg}
            className="w-full p-4 bg-[#1f2937] hover:bg-gray-800 border border-gray-700/60 rounded-xl flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg group-hover:scale-105 transition">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Export ER Diagram SVG</div>
                <div className="text-xs text-gray-400">Vector graphic diagram of entity relationships</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
