import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import type { JoinType, Table, JoinResult } from '../types';
import { customersTable, ordersTable } from '../data/join-datasets';
import { computeJoin } from '../lib/joinEngine';
import SqlDisplay from '../components/shared/SqlDisplay';
import InfoPanel from '../components/shared/InfoPanel';

const JOIN_TYPES: { value: JoinType; label: string }[] = [
  { value: 'INNER', label: 'INNER' },
  { value: 'LEFT', label: 'LEFT' },
  { value: 'RIGHT', label: 'RIGHT' },
  { value: 'FULL_OUTER', label: 'FULL OUTER' },
  { value: 'CROSS', label: 'CROSS' },
];

const JOIN_DESCRIPTIONS: Record<JoinType, { summary: string; analogy: string; watch: string }> = {
  INNER: {
    summary:
      'Returns only rows where the join condition is satisfied in both tables. Rows without a match are excluded entirely.',
    analogy:
      'Think of it like matching socks from two laundry piles — only pairs that match on color get kept. Socks with no match are discarded.',
    watch:
      'Notice that customer "Eve" (who has no orders) and order #106 (which references a non-existent customer) are both excluded from the result.',
  },
  LEFT: {
    summary:
      'Returns ALL rows from the left table, plus matched rows from the right table. If a left row has no match, the right side is filled with NULL.',
    analogy:
      'Like taking attendance — every student on the left-side roster appears in the result, even if they didn\'t turn in an assignment (right side). Missing assignments show as NULL.',
    watch:
      'Notice that "Eve" appears in the result even though she has no orders — the order columns are filled with NULL. But order #106 (no matching customer) is still excluded because it\'s from the right table.',
  },
  RIGHT: {
    summary:
      'Returns ALL rows from the right table, plus matched rows from the left table. If a right row has no match, the left side is filled with NULL.',
    analogy:
      'The mirror image of LEFT JOIN — this time, every row from the right table is guaranteed to appear, even if it has no match on the left.',
    watch:
      'Notice that order #106 now appears (its customer columns are NULL), but "Eve" is excluded because she\'s in the left table and has no matching orders.',
  },
  FULL_OUTER: {
    summary:
      'Returns all rows from both tables. Where there is no match on either side, the missing columns are filled with NULL.',
    analogy:
      'Like combining two guest lists for an event — everyone from both lists appears, and if someone is only on one list, the other side shows as blank.',
    watch:
      'Notice that both "Eve" (no orders) and order #106 (no customer) appear in the result — neither side loses any data.',
  },
  CROSS: {
    summary:
      'Returns every possible combination of rows from both tables (called a Cartesian product). No join condition is used.',
    analogy:
      'Like combining every shirt with every pair of pants to see all possible outfits. If you have 5 shirts and 6 pants, you get 30 combinations.',
    watch:
      'Notice the result has 30 rows (5 customers × 6 orders). Every customer is paired with every order, regardless of whether they match.',
  },
};

// Join types that exclude unmatched left rows
const EXCLUDES_UNMATCHED_LEFT: Set<JoinType> = new Set(['INNER', 'RIGHT']);
// Join types that exclude unmatched right rows
const EXCLUDES_UNMATCHED_RIGHT: Set<JoinType> = new Set(['INNER', 'LEFT']);

export default function JoinVisualizerPage() {
  const [joinType, setJoinType] = useState<JoinType>('INNER');
  const [leftTable] = useState<Table>(
    () => JSON.parse(JSON.stringify(customersTable)) as Table
  );
  const [rightTable] = useState<Table>(
    () => JSON.parse(JSON.stringify(ordersTable)) as Table
  );
  const [visibleRows, setVisibleRows] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const joinResult: JoinResult = useMemo(
    () => computeJoin(leftTable, rightTable, 'customer_id', 'customer_id', joinType),
    [leftTable, rightTable, joinType]
  );

  const totalRows = joinResult.rows.length;

  // Reset animation when join type changes
  useEffect(() => {
    setVisibleRows(0);
    setIsPlaying(false);
  }, [joinType]);

  // Animation interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying && visibleRows < totalRows) {
      intervalRef.current = setInterval(() => {
        setVisibleRows((prev) => {
          const next = prev + 1;
          if (next >= totalRows) {
            setIsPlaying(false);
          }
          return next;
        });
      }, speed);
    }

    if (isPlaying && visibleRows >= totalRows) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, totalRows, visibleRows]);

  const handlePlay = useCallback(() => {
    if (visibleRows >= totalRows) {
      setVisibleRows(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [visibleRows, totalRows]);

  const handleStep = useCallback(() => {
    setIsPlaying(false);
    setVisibleRows((prev) => Math.min(prev + 1, totalRows));
  }, [totalRows]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setVisibleRows(0);
  }, []);

  // Determine which source rows to highlight/dim
  const leftHighlighted = joinResult.matchedLeftIds;
  const rightHighlighted = joinResult.matchedRightIds;

  // Build dynamic result table columns
  const resultColumns = useMemo(() => {
    const left = leftTable.columns.map((col) => ({
      key: `left.${col.id}`,
      label: `${leftTable.name}.${col.name}`,
      side: 'left' as const,
      colId: col.name,
    }));
    const right = rightTable.columns.map((col) => ({
      key: `right.${col.id}`,
      label: `${rightTable.name}.${col.name}`,
      side: 'right' as const,
      colId: col.name,
    }));
    return [...left, ...right];
  }, [leftTable, rightTable]);

  const visibleResultRows = joinResult.rows.slice(0, visibleRows);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Join Visualizer</h1>
        <p className="text-slate-400 mt-1">
          See how different SQL joins combine rows from two tables step by step.
        </p>
      </div>

      {/* Intro explanation */}
      <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4 space-y-3">
        <p className="text-sm text-slate-300 leading-relaxed">
          In a relational database, data is split across multiple tables. A{' '}
          <span className="text-primary-300 font-medium">JOIN</span> is how you combine data from two
          tables into a single result based on a shared column. Below, the{' '}
          <span className="text-white font-medium">Customers</span> and{' '}
          <span className="text-white font-medium">Orders</span> tables share a{' '}
          <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">customer_id</code> column — the
          join uses this to match each order with its customer.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          The data is intentionally set up with two edge cases: customer{' '}
          <span className="text-amber-300 font-medium">"Eve"</span> has no orders, and order{' '}
          <span className="text-amber-300 font-medium">#106</span> references a customer that doesn't
          exist. Watch how different join types handle these mismatches.
        </p>
        <p className="text-xs text-slate-500">
          Use the buttons below to switch join types, then press <span className="text-slate-400">Play</span> to
          watch the animation or <span className="text-slate-400">Step</span> to go one row at a time.
        </p>
      </div>

      {/* Join Type Selector */}
      <div className="flex">
        <div className="inline-flex rounded-lg overflow-hidden border border-slate-600">
          {JOIN_TYPES.map(({ value, label }, index) => (
            <button
              key={value}
              onClick={() => setJoinType(value)}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                joinType === value
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              } ${index > 0 ? 'border-l border-slate-600' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Source Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourceTable
          table={leftTable}
          matchedIds={leftHighlighted}
          dimUnmatched={EXCLUDES_UNMATCHED_LEFT.has(joinType)}
        />
        <SourceTable
          table={rightTable}
          matchedIds={rightHighlighted}
          dimUnmatched={EXCLUDES_UNMATCHED_RIGHT.has(joinType)}
        />
      </div>

      {/* Result Section + Venn Diagram */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-start">
        {/* Result Table */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Result{' '}
            <span className="text-sm font-normal text-slate-400">
              ({visibleRows} of {totalRows} rows)
            </span>
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-700">
                  {resultColumns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-xs uppercase tracking-wider whitespace-nowrap ${
                        col.side === 'left'
                          ? 'text-blue-300'
                          : 'text-amber-300'
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {visibleResultRows.map((resultRow, index) => (
                    <motion.tr
                      key={`result-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`border-b border-slate-700 ${
                        resultRow.isMatched
                          ? 'bg-success-100/10 border-l-2 border-l-success-500'
                          : 'bg-danger-50/10 border-l-2 border-l-danger-300'
                      }`}
                    >
                      {resultColumns.map((col) => {
                        const row =
                          col.side === 'left'
                            ? resultRow.leftRow
                            : resultRow.rightRow;
                        const value = row
                          ? row.cells[col.colId] ?? null
                          : null;

                        return (
                          <td
                            key={col.key}
                            className="px-3 py-1.5 text-sm font-mono whitespace-nowrap"
                          >
                            {value === null || value === undefined ? (
                              <span className="italic text-slate-500">NULL</span>
                            ) : (
                              String(value)
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {visibleRows === 0 && (
                  <tr>
                    <td
                      colSpan={resultColumns.length}
                      className="px-4 py-8 text-center text-slate-500 text-sm"
                    >
                      Press Play or Step to begin the animation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Venn Diagram */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-white mb-3">
            Diagram
          </h3>
          <VennDiagram joinType={joinType} leftName={leftTable.name} rightName={rightTable.name} />
        </div>
      </div>

      {/* Animation Controls */}
      <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg border border-slate-700 px-4 py-3">
        <button
          onClick={handlePlay}
          className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span className="text-sm">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="text-sm">Play</span>
            </>
          )}
        </button>

        <button
          onClick={handleStep}
          disabled={visibleRows >= totalRows}
          className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
          <span className="text-sm">Step</span>
        </button>

        <button
          onClick={handleReset}
          className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>

        <div className="h-6 w-px bg-slate-600" />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          Speed
          <input
            type="range"
            min={100}
            max={1500}
            step={50}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-28 accent-primary-500"
          />
          <span className="text-xs text-slate-400 w-12 tabular-nums">
            {speed}ms
          </span>
        </label>

        {/* Progress indicator */}
        <div className="ml-auto text-xs text-slate-400 tabular-nums">
          {visibleRows} / {totalRows}
        </div>
      </div>

      {/* SQL Display */}
      <SqlDisplay sql={joinResult.sql} title="Generated SQL" />

      {/* Info Panel */}
      <InfoPanel title={`About ${joinType.replace('_', ' ')} JOIN`} defaultOpen>
        <div className="space-y-3">
          <p className="text-slate-300">{JOIN_DESCRIPTIONS[joinType].summary}</p>
          <div className="bg-slate-700/40 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">Analogy</p>
            <p className="text-sm text-slate-300">{JOIN_DESCRIPTIONS[joinType].analogy}</p>
          </div>
          <div className="bg-primary-500/10 rounded-lg p-3">
            <p className="text-xs text-primary-400 uppercase tracking-wider mb-1 font-medium">What to watch for</p>
            <p className="text-sm text-slate-300">{JOIN_DESCRIPTIONS[joinType].watch}</p>
          </div>
          {joinType !== 'CROSS' && (
            <div className="space-y-1 pt-1">
              <p className="text-slate-400 text-xs">
                <span className="inline-block w-3 h-3 rounded-sm bg-success-100/30 border border-success-500 mr-1.5 align-middle" />
                Green rows = matched (join condition satisfied)
              </p>
              <p className="text-slate-400 text-xs">
                <span className="inline-block w-3 h-3 rounded-sm bg-danger-50/30 border border-danger-300 mr-1.5 align-middle" />
                Red rows = unmatched (NULL-filled on the missing side)
              </p>
            </div>
          )}
        </div>
      </InfoPanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SourceTable: renders a DataTable with match/dim highlighting overlaid
// ---------------------------------------------------------------------------

interface SourceTableProps {
  table: Table;
  matchedIds: Set<string>;
  dimUnmatched: boolean;
}

function SourceTable({ table, matchedIds, dimUnmatched }: SourceTableProps) {
  // Build a set of unmatched row IDs for dimming
  const unmatchedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of table.rows) {
      if (!matchedIds.has(row.id)) {
        ids.add(row.id);
      }
    }
    return ids;
  }, [table.rows, matchedIds]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-3">{table.name}</h3>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-700">
              {table.columns.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 text-slate-300 text-xs uppercase tracking-wider"
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => {
              const isMatched = matchedIds.has(row.id);
              const isDimmed = dimUnmatched && unmatchedIds.has(row.id);

              let rowClass = 'bg-slate-800';
              if (isMatched) {
                rowClass = 'bg-success-100/10';
              } else if (isDimmed) {
                rowClass = 'bg-danger-50/10 opacity-50';
              }

              return (
                <motion.tr
                  key={row.id}
                  layout
                  className={`border-b border-slate-700 transition-colors ${rowClass}`}
                >
                  {table.columns.map((col) => {
                    const value = row.cells[col.name];
                    return (
                      <td key={col.id} className="px-4 py-2 text-sm font-mono">
                        {value === null || value === undefined ? (
                          <span className="italic text-slate-500">NULL</span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VennDiagram: SVG showing which regions are included in the join
// ---------------------------------------------------------------------------

interface VennDiagramProps {
  joinType: JoinType;
  leftName: string;
  rightName: string;
}

function VennDiagram({ joinType, leftName, rightName }: VennDiagramProps) {
  // Determine which regions to shade
  const shadeLeft = joinType === 'LEFT' || joinType === 'FULL_OUTER' || joinType === 'CROSS';
  const shadeOverlap =
    joinType === 'INNER' ||
    joinType === 'LEFT' ||
    joinType === 'RIGHT' ||
    joinType === 'FULL_OUTER' ||
    joinType === 'CROSS';
  const shadeRight = joinType === 'RIGHT' || joinType === 'FULL_OUTER' || joinType === 'CROSS';

  const isCross = joinType === 'CROSS';

  // Circle parameters -- two overlapping circles
  const cx1 = 80;
  const cx2 = 140;
  const cy = 95;
  const r = 60;

  return (
    <svg
      width={220}
      height={190}
      viewBox="0 0 220 190"
      className="shrink-0"
    >
      {/* Left-only shaded area */}
      <motion.circle
        cx={cx1}
        cy={cy}
        r={r}
        fill={isCross ? '#8b5cf6' : '#3b82f6'}
        initial={{ fillOpacity: 0 }}
        animate={{ fillOpacity: shadeLeft ? 0.3 : 0 }}
        transition={{ duration: 0.4 }}
        stroke={isCross ? '#8b5cf6' : '#60a5fa'}
        strokeWidth={2}
        strokeDasharray={isCross ? '6 3' : 'none'}
      />

      {/* Right-only shaded area */}
      <motion.circle
        cx={cx2}
        cy={cy}
        r={r}
        fill={isCross ? '#8b5cf6' : '#3b82f6'}
        initial={{ fillOpacity: 0 }}
        animate={{ fillOpacity: shadeRight ? 0.3 : 0 }}
        transition={{ duration: 0.4 }}
        stroke={isCross ? '#8b5cf6' : '#60a5fa'}
        strokeWidth={2}
        strokeDasharray={isCross ? '6 3' : 'none'}
      />

      {/* Overlap region -- drawn on top to ensure it always appears shaded when needed */}
      {shadeOverlap && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* We create the overlap by drawing both circles clipped to the other's bounding area */}
          <clipPath id="clip-overlap-left">
            <circle cx={cx1} cy={cy} r={r} />
          </clipPath>
          <clipPath id="clip-overlap-right">
            <circle cx={cx2} cy={cy} r={r} />
          </clipPath>
          <circle
            cx={cx2}
            cy={cy}
            r={r}
            fill={isCross ? '#a78bfa' : '#60a5fa'}
            fillOpacity={0.45}
            clipPath="url(#clip-overlap-left)"
          />
        </motion.g>
      )}

      {/* Circle outlines on top */}
      <circle
        cx={cx1}
        cy={cy}
        r={r}
        fill="none"
        stroke={isCross ? '#8b5cf6' : '#60a5fa'}
        strokeWidth={2}
        strokeDasharray={isCross ? '6 3' : 'none'}
      />
      <circle
        cx={cx2}
        cy={cy}
        r={r}
        fill="none"
        stroke={isCross ? '#8b5cf6' : '#60a5fa'}
        strokeWidth={2}
        strokeDasharray={isCross ? '6 3' : 'none'}
      />

      {/* Labels */}
      <text
        x={cx1 - 30}
        y={cy + r + 24}
        textAnchor="middle"
        className="fill-slate-300 text-xs"
        fontSize={12}
      >
        {leftName}
      </text>
      <text
        x={cx2 + 30}
        y={cy + r + 24}
        textAnchor="middle"
        className="fill-slate-300 text-xs"
        fontSize={12}
      >
        {rightName}
      </text>

      {/* Join type label at top */}
      <text
        x={110}
        y={18}
        textAnchor="middle"
        className="fill-white text-sm font-medium"
        fontSize={13}
        fontWeight={600}
      >
        {joinType.replace('_', ' ')} JOIN
      </text>
    </svg>
  );
}
