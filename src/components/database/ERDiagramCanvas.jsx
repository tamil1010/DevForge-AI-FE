import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Key, Link as LinkIcon, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

// Custom Table Node Component for React Flow canvas
const TableNode = ({ data }) => {
  return (
    <div className="bg-[#111827] border-2 border-indigo-500/80 rounded-xl overflow-hidden shadow-2xl min-w-[200px] text-xs font-mono">
      <div className="px-3 py-2 bg-indigo-900/40 border-b border-indigo-500/40 font-bold text-white uppercase tracking-wider text-center flex items-center justify-between">
        <span>{data.label}</span>
      </div>
      <div className="p-2 space-y-1 bg-[#0b0f17]">
        {data.columns?.map((col, idx) => (
          <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 px-1 rounded hover:bg-gray-800/50">
            <div className="flex items-center space-x-1.5 truncate">
              {col.isPrimaryKey ? (
                <Key className="w-3 h-3 text-amber-400 flex-shrink-0" />
              ) : col.isForeignKey ? (
                <LinkIcon className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              ) : (
                <span className="w-3" />
              )}
              <span className={col.isPrimaryKey ? 'text-amber-300 font-semibold' : 'text-gray-200'}>{col.name}</span>
            </div>
            <span className="text-[10px] text-indigo-300 font-light ml-2">{col.dataType}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode
};

export default function ERDiagramCanvas({ schema, relationships = [] }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Generate Nodes and Edges from Schema
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!schema || !schema.tables) return { initialNodes: [], initialEdges: [] };

    const nodes = [];
    const edges = [];

    const colsPerRow = Math.ceil(Math.sqrt(schema.tables.length));

    schema.tables.forEach((table, idx) => {
      const row = Math.floor(idx / colsPerRow);
      const col = idx % colsPerRow;

      nodes.push({
        id: table.name.toLowerCase(),
        type: 'tableNode',
        position: { x: col * 320 + 50, y: row * 280 + 50 },
        data: {
          label: table.name,
          columns: table.columns
        }
      });
    });

    // Generate edges from FK references
    schema.tables.forEach((table) => {
      table.columns.forEach((col) => {
        if (col.isForeignKey && col.references && col.references.table) {
          const targetTable = col.references.table.toLowerCase();
          const sourceTable = table.name.toLowerCase();

          edges.push({
            id: `edge_${sourceTable}_${targetTable}_${col.name}`,
            source: sourceTable,
            target: targetTable,
            label: '1 : N',
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
            animated: true
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [schema]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = (event, node) => {
    setSelectedItem({ type: 'table', data: node.data });
  };

  const onEdgeClick = (event, edge) => {
    setSelectedItem({ type: 'edge', data: edge });
  };

  if (!schema || !schema.tables || schema.tables.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
        Generate the relational schema first to render the interactive ER Diagram.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0b0f17] p-6' : ''}`}>
      {/* Top Diagram Header Toolbar */}
      <div className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-3">
        <div className="text-xs font-semibold text-white flex items-center space-x-2">
          <span>Interactive ER Diagram Visualizer</span>
          <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[10px] font-mono">
            {nodes.length} Tables | {edges.length} Relationships
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative border border-gray-800 rounded-xl overflow-hidden bg-[#0d121f] h-[600px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
        >
          <Controls className="bg-[#111827] border border-gray-800 text-white rounded-lg p-1" />
          <MiniMap className="bg-[#111827] border border-gray-800 rounded-lg overflow-hidden" nodeColor={() => '#4f46e5'} />
          <Background color="#1f2937" gap={20} size={1} />
        </ReactFlow>

        {/* Floating Details Overlay */}
        {selectedItem && (
          <div className="absolute top-4 right-4 bg-[#111827]/95 border border-gray-800 rounded-xl p-4 w-72 text-xs backdrop-blur shadow-2xl z-20">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
              <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                {selectedItem.type === 'table' ? 'Table Details' : 'Relationship Details'}
              </span>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            {selectedItem.type === 'table' ? (
              <div className="space-y-2">
                <div className="font-mono text-sm font-bold text-indigo-400">{selectedItem.data.label}</div>
                <div className="text-[11px] text-gray-300">Contains {selectedItem.data.columns?.length || 0} attributes</div>
              </div>
            ) : (
              <div className="space-y-1 font-mono text-[11px]">
                <div>Source: <span className="text-indigo-400">{selectedItem.data.source}</span></div>
                <div>Target: <span className="text-purple-400">{selectedItem.data.target}</span></div>
                <div>Cardinality: <span className="text-emerald-400">{selectedItem.data.label}</span></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
