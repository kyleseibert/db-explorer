import { Key, Link } from 'lucide-react';
import { motion } from 'motion/react';
import type { Table } from '../../types';

interface DataTableProps {
  table: Table;
  highlightedRows?: Set<string>;
  onRowClick?: (rowId: string) => void;
  compact?: boolean;
  className?: string;
}

export default function DataTable({
  table,
  highlightedRows,
  onRowClick,
  compact = false,
  className = '',
}: DataTableProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-white mb-3">{table.name}</h3>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-700">
              {table.columns.map((col) => (
                <th
                  key={col.id}
                  className={`text-slate-300 text-xs uppercase tracking-wider ${
                    compact ? 'px-3 py-1.5' : 'px-4 py-3'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-600 text-slate-300 normal-case tracking-normal">
                      {col.type}
                    </span>
                    {col.isPrimaryKey && (
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    {col.isForeignKey && (
                      <Link className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => {
              const isHighlighted = highlightedRows?.has(row.id);
              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onRowClick?.(row.id)}
                  className={`border-b border-slate-700 transition-colors ${
                    isHighlighted
                      ? 'bg-primary-500/20 ring-1 ring-primary-400/50'
                      : 'bg-slate-800 hover:bg-slate-700/50'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {table.columns.map((col) => {
                    const value = row.cells[col.name];
                    return (
                      <td
                        key={col.id}
                        className={`text-sm font-mono ${
                          compact ? 'px-3 py-1.5' : 'px-4 py-2'
                        }`}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
