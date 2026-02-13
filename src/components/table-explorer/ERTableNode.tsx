import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { Key, Link } from 'lucide-react';
import type { Table } from '../../types';

type ERTableNodeData = Node<{ table: Table; label: string }, 'tableNode'>;

export default function ERTableNode({ data }: NodeProps<ERTableNodeData>) {
  const { table } = data;

  return (
    <div className="min-w-[200px] border border-slate-600 rounded-lg shadow-lg">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary-400 !border-2 !border-slate-900"
      />

      <div className="bg-slate-700 text-white font-bold px-4 py-2 rounded-t-lg">
        {table.name}
      </div>

      <div className="bg-slate-800 rounded-b-lg">
        {table.columns.map((col) => (
          <div
            key={col.id}
            className="flex items-center gap-2 px-4 py-1.5 text-sm text-slate-300 border-t border-slate-700 first:border-t-0"
          >
            {col.isPrimaryKey && (
              <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            {col.isForeignKey && (
              <Link className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            )}
            {!col.isPrimaryKey && !col.isForeignKey && (
              <span className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="font-mono">{col.name}</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-600 text-slate-400">
              {col.type}
            </span>
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary-400 !border-2 !border-slate-900"
      />
    </div>
  );
}
