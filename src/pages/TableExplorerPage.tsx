import { useState, useMemo, useCallback } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { TableProperties, Network, Code, Info, Key, Link } from 'lucide-react';

import type { DatabaseSchema } from '../types';
import { musicLibrarySchema } from '../data/music-library';
import { findAllRelatedRows } from '../lib/tableUtils';
import { generateCreateTableSql } from '../lib/sqlGenerator';

import DataTable from '../components/shared/DataTable';
import SqlDisplay from '../components/shared/SqlDisplay';
import InfoPanel from '../components/shared/InfoPanel';
import ERTableNode from '../components/table-explorer/ERTableNode';

export default function TableExplorerPage() {
  const [schema] = useState<DatabaseSchema>(musicLibrarySchema);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [highlightedRows, setHighlightedRows] = useState<Map<string, Set<string>>>(
    new Map()
  );
  const [viewMode, setViewMode] = useState<'tables' | 'er'>('tables');

  const nodeTypes = useMemo(() => ({ tableNode: ERTableNode }), []);

  const handleRowClick = useCallback(
    (tableId: string, rowId: string) => {
      // Clicking the same row again clears the highlighting
      if (selectedRowId === rowId && selectedTableId === tableId) {
        setSelectedRowId(null);
        setSelectedTableId(null);
        setHighlightedRows(new Map());
        return;
      }

      const table = schema.tables.find((t) => t.id === tableId);
      const row = table?.rows.find((r) => r.id === rowId);
      if (!table || !row) return;

      const related = findAllRelatedRows(row, table, schema);

      // Also add the clicked row itself to the highlighted set
      if (!related.has(tableId)) {
        related.set(tableId, new Set());
      }
      related.get(tableId)!.add(rowId);

      setSelectedRowId(rowId);
      setSelectedTableId(tableId);
      setHighlightedRows(related);
    },
    [schema, selectedRowId, selectedTableId]
  );

  const createTableSql = useMemo(
    () =>
      schema.tables.map((t) => generateCreateTableSql(t)).join('\n\n'),
    [schema]
  );

  // ReactFlow nodes and edges for ER Diagram view
  const flowNodes: Node[] = useMemo(
    () =>
      schema.tables.map((table) => ({
        id: table.id,
        type: 'tableNode',
        position: table.position ?? { x: 0, y: 0 },
        data: { table, label: table.name },
      })),
    [schema]
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      schema.relationships.map((rel) => ({
        id: rel.id,
        source: rel.targetTableId,
        target: rel.sourceTableId,
        label: rel.type,
        animated: true,
        style: { stroke: '#60a5fa', strokeWidth: 2 },
        labelStyle: { fill: '#94a3b8', fontWeight: 600, fontSize: 12 },
        labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9 },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
      })),
    [schema]
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TableProperties className="w-6 h-6 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Table Explorer</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle button group */}
          <div className="flex bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => setViewMode('tables')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                viewMode === 'tables'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              Tables
            </button>
            <button
              onClick={() => setViewMode('er')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                viewMode === 'er'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Network className="w-4 h-4" />
              ER Diagram
            </button>
          </div>
        </div>
      </div>

      {/* Intro text */}
      <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          This is a small <span className="text-primary-300 font-medium">music library database</span> with
          three tables: <span className="text-white font-medium">Artists</span>,{' '}
          <span className="text-white font-medium">Albums</span>, and{' '}
          <span className="text-white font-medium">Songs</span>. Each album belongs to an artist, and each
          song belongs to an album. These connections are created using{' '}
          <span className="text-blue-400 font-medium">foreign keys</span> — columns that point to a row in
          another table. Try clicking any row to see how data is connected across all three tables.
        </p>
      </div>

      {/* View content */}
      <AnimatePresence mode="wait">
        {viewMode === 'tables' ? (
          <motion.div
            key="tables"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Tables row */}
            <div className="flex gap-8 overflow-x-auto pb-2">
              {schema.tables.map((table) => (
                <div key={table.id} className="shrink-0 flex-1 min-w-[280px]">
                  <DataTable
                    table={table}
                    highlightedRows={highlightedRows.get(table.id)}
                    onRowClick={(rowId) => handleRowClick(table.id, rowId)}
                  />
                </div>
              ))}
            </div>

            {/* Key concepts */}
            <InfoPanel title="Understanding tables, keys, and relationships" defaultOpen>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Key className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-400 mb-1">Primary Keys (PK)</p>
                    <p className="text-sm text-slate-300">
                      Every table needs a way to uniquely identify each row. That's the{' '}
                      <span className="text-amber-300">primary key</span> — usually a number like an ID. In the
                      Artists table, <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">artist_id</code> is
                      the primary key. No two artists can have the same ID, which is how the database
                      tells them apart.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Link className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-400 mb-1">Foreign Keys (FK)</p>
                    <p className="text-sm text-slate-300">
                      A <span className="text-blue-300">foreign key</span> is a column in one table that
                      references the primary key in another table. For example, the Albums table has an{' '}
                      <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">artist_id</code> column — this
                      is a foreign key that tells you which artist made each album. It's like saying "this
                      album belongs to artist #3."
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-primary-400 mb-1">Try it: Click any row</p>
                    <p className="text-sm text-slate-300">
                      Click on any row in any table to see its <span className="text-primary-300">related
                      data</span> highlighted across all tables. For example, click on an artist to see all
                      of their albums and songs light up. Click the same row again to clear the selection.
                      This shows you how foreign keys create connections between tables.
                    </p>
                  </div>
                </div>
              </div>
            </InfoPanel>

            {/* SQL panel */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">SQL Schema</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                Below is the SQL code that would create these tables in a real database. The{' '}
                <code className="bg-slate-700 px-1 py-0.5 rounded">CREATE TABLE</code> statement defines each
                table's columns, their data types, and which columns are primary or foreign keys.
              </p>
              <SqlDisplay sql={createTableSql} title="CREATE TABLE statements" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="er"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* ER Diagram explanation */}
            <InfoPanel title="What is an ER Diagram?" defaultOpen>
              <p className="text-sm text-slate-300 leading-relaxed">
                An <span className="text-primary-300 font-medium">Entity-Relationship (ER) diagram</span> is a
                visual map of your database. Each box represents a table, showing its columns and their
                types. The lines between boxes show relationships — how the tables connect through
                foreign keys. The labels on the lines (like <span className="text-white font-medium">1:N</span>)
                tell you the relationship type: "1:N" means "one-to-many," for example one artist can
                have many albums. You can drag the boxes around to rearrange the diagram.
              </p>
            </InfoPanel>

            <div className="h-[600px] w-full rounded-lg border border-slate-700 overflow-hidden">
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                style={{ background: '#0f172a' }}
              >
                <Background color="#334155" gap={20} size={1} />
                <Controls />
              </ReactFlow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
