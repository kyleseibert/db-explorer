import { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Box,
  Eye,
  EyeOff,
  RotateCw,
  Focus,
  RotateCcw,
} from 'lucide-react';

import type { DatabaseSchema } from '../types';
import { musicLibrarySchema } from '../data/music-library';
import { findAllRelatedRows } from '../lib/tableUtils';
import InfoPanel from '../components/shared/InfoPanel';
import TableScene from '../components/three-d-view/TableScene';

const TABLE_LABELS: { id: string; name: string; color: string }[] = [
  { id: 'artists', name: 'Artists', color: '#60a5fa' },
  { id: 'albums', name: 'Albums', color: '#a78bfa' },
  { id: 'songs', name: 'Songs', color: '#4ade80' },
];

export default function ThreeDViewPage() {
  const [schema] = useState<DatabaseSchema>(musicLibrarySchema);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [highlightedRows, setHighlightedRows] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [focusedTableId, setFocusedTableId] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const handleRowClick = useCallback(
    (tableId: string, rowId: string) => {
      // Clicking same row clears highlighting
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

      // Also add the clicked row itself
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

  const handleTableClick = useCallback(
    (tableId: string) => {
      setFocusedTableId((prev) => (prev === tableId ? null : tableId));
    },
    []
  );

  const handleResetCamera = useCallback(() => {
    setFocusedTableId(null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRowId(null);
    setSelectedTableId(null);
    setHighlightedRows(new Map());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Box className="w-6 h-6 text-accent-400" />
        <h1 className="text-2xl font-bold text-white">3D Table Landscape</h1>
      </div>

      {/* Intro */}
      <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4 space-y-2">
        <p className="text-sm text-slate-300 leading-relaxed">
          Explore the same{' '}
          <span className="text-primary-300 font-medium">
            music library database
          </span>{' '}
          in three dimensions. Each table floats as a translucent panel in 3D
          space, and{' '}
          <span className="text-primary-300 font-medium">
            glowing connection lines
          </span>{' '}
          trace the foreign key relationships between them. Drag to orbit, scroll
          to zoom, and click any row to see its related data light up across all
          tables.
        </p>
        <p className="text-xs text-slate-500">
          Use the controls in the top-right corner to focus on individual tables,
          toggle connections, or enable auto-rotation.
        </p>
      </div>

      {/* 3D Canvas + Overlay */}
      <div className="relative h-[70vh] min-h-[500px] rounded-lg border border-slate-700 overflow-hidden">
        <Canvas
          camera={{ position: [0, 4, 10], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <TableScene
              schema={schema}
              selectedTableId={selectedTableId}
              highlightedRows={highlightedRows}
              focusedTableId={focusedTableId}
              showConnections={showConnections}
              autoRotate={autoRotate}
              onRowClick={handleRowClick}
              onTableClick={handleTableClick}
            />
          </Suspense>
        </Canvas>

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 p-3 space-y-3 min-w-[180px]">
          {/* Focus on table */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1.5">
              Focus Table
            </p>
            <div className="flex flex-col gap-1">
              {TABLE_LABELS.map(({ id, name, color }) => (
                <button
                  key={id}
                  onClick={() => handleTableClick(id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                    focusedTableId === id
                      ? 'bg-slate-600/50 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <Focus className="w-3 h-3" />
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700" />

          {/* Toggles */}
          <div className="space-y-1.5">
            <button
              onClick={() => setShowConnections((v) => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer w-full text-left text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {showConnections ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              {showConnections ? 'Hide' : 'Show'} Connections
            </button>
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer w-full text-left text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {autoRotate ? (
                <RotateCw className="w-3.5 h-3.5" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Auto-Rotate {autoRotate ? 'On' : 'Off'}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700" />

          {/* Action buttons */}
          <div className="space-y-1.5">
            <button
              onClick={handleResetCamera}
              className="w-full px-2.5 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer text-left"
            >
              Reset Camera
            </button>
            {highlightedRows.size > 0 && (
              <button
                onClick={handleClearSelection}
                className="w-full px-2.5 py-1.5 rounded text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="border-t border-slate-700 pt-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1.5">
              Connections
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span
                  className="w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: '#60a5fa' }}
                />
                Artists &harr; Albums
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span
                  className="w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: '#a78bfa' }}
                />
                Albums &harr; Songs
              </div>
            </div>
          </div>
        </div>

        {/* Selection indicator (bottom-left overlay) */}
        {selectedRowId && selectedTableId && (
          <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 px-3 py-2">
            <p className="text-xs text-slate-400">
              Selected:{' '}
              <span className="text-white font-medium">
                {schema.tables.find((t) => t.id === selectedTableId)?.name}
              </span>
              {' row '}
              <span className="text-primary-300 font-medium">
                {(() => {
                  const table = schema.tables.find(
                    (t) => t.id === selectedTableId
                  );
                  const row = table?.rows.find((r) => r.id === selectedRowId);
                  const pkCol = table?.columns.find((c) => c.isPrimaryKey);
                  return pkCol && row
                    ? String(row.cells[pkCol.name])
                    : selectedRowId;
                })()}
              </span>
              {' '}
              &middot;{' '}
              <span className="text-slate-500">
                {Array.from(highlightedRows.values()).reduce(
                  (sum, set) => sum + set.size,
                  0
                )}{' '}
                related rows highlighted
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Educational content */}
      <InfoPanel title="Understanding the 3D view" defaultOpen>
        <div className="space-y-3">
          <p className="text-slate-300">
            This 3D visualization shows the same{' '}
            <span className="text-white font-medium">
              Music Library database
            </span>{' '}
            from the Table Explorer, but arranged in three-dimensional space.
            Each floating panel represents a table, and the curved lines between
            them represent foreign key relationships.
          </p>
          <div className="bg-slate-700/40 rounded-lg p-3 space-y-2">
            <p className="text-xs text-primary-400 uppercase tracking-wider font-medium">
              How to interact
            </p>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>
                <span className="text-white font-medium">Orbit:</span> Click and
                drag to rotate the view around the tables
              </li>
              <li>
                <span className="text-white font-medium">Zoom:</span> Scroll
                to zoom in and out
              </li>
              <li>
                <span className="text-white font-medium">Click a row:</span>{' '}
                Highlights all related data across tables — the connection lines
                brighten and a glowing particle travels along them to show the
                data flow
              </li>
              <li>
                <span className="text-white font-medium">Focus:</span> Use the
                control panel buttons to fly the camera to a specific table
              </li>
            </ul>
          </div>
          <p className="text-sm text-slate-300">
            The spatial arrangement helps you visualize the{' '}
            <span className="text-primary-300">direction of relationships</span>
            . The{' '}
            <span style={{ color: '#60a5fa' }} className="font-medium">
              blue line
            </span>{' '}
            connects Artists to Albums (one artist has many albums), and the{' '}
            <span style={{ color: '#a78bfa' }} className="font-medium">
              purple line
            </span>{' '}
            connects Albums to Songs (one album has many songs). This creates a
            chain: Artist → Albums → Songs.
          </p>
        </div>
      </InfoPanel>
    </div>
  );
}
