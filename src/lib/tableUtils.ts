import type { Row, Table, ForeignKeyRelationship, DatabaseSchema } from '../types';

/**
 * Find all rows in targetTable that are related to a given row in sourceTable
 * through a foreign key relationship.
 *
 * Returns an array of related row IDs in targetTable.
 */
export function findRelatedRows(
  sourceRow: Row,
  sourceTable: Table,
  targetTable: Table,
  relationships: ForeignKeyRelationship[]
): string[] {
  const relatedIds: string[] = [];

  for (const rel of relationships) {
    // Case 1: sourceTable has FK pointing to targetTable
    // e.g., Albums.artist_id → Artists.id
    if (rel.sourceTableId === sourceTable.id && rel.targetTableId === targetTable.id) {
      const sourceColumn = sourceTable.columns.find((c) => c.id === rel.sourceColumnId);
      const targetColumn = targetTable.columns.find((c) => c.id === rel.targetColumnId);

      if (sourceColumn && targetColumn) {
        const fkValue = sourceRow.cells[sourceColumn.name] ?? null;
        if (fkValue !== null) {
          for (const targetRow of targetTable.rows) {
            const pkValue = targetRow.cells[targetColumn.name] ?? null;
            if (pkValue !== null && String(fkValue) === String(pkValue)) {
              relatedIds.push(targetRow.id);
            }
          }
        }
      }
    }

    // Case 2: targetTable has FK pointing to sourceTable
    // e.g., sourceTable = Artists, targetTable = Albums where Albums.artist_id → Artists.id
    if (rel.sourceTableId === targetTable.id && rel.targetTableId === sourceTable.id) {
      const targetFkColumn = targetTable.columns.find((c) => c.id === rel.sourceColumnId);
      const sourcePkColumn = sourceTable.columns.find((c) => c.id === rel.targetColumnId);

      if (targetFkColumn && sourcePkColumn) {
        const pkValue = sourceRow.cells[sourcePkColumn.name] ?? null;
        if (pkValue !== null) {
          for (const targetRow of targetTable.rows) {
            const fkValue = targetRow.cells[targetFkColumn.name] ?? null;
            if (fkValue !== null && String(fkValue) === String(pkValue)) {
              relatedIds.push(targetRow.id);
            }
          }
        }
      }
    }
  }

  return relatedIds;
}

/**
 * Find all related rows across ALL tables for a given row, following
 * relationships transitively.
 *
 * For example, clicking an Artist row will highlight related Albums AND Songs
 * (Songs are related through Albums).
 *
 * Returns a Map from tableId to the set of related rowIds in that table.
 */
export function findAllRelatedRows(
  sourceRow: Row,
  sourceTable: Table,
  schema: DatabaseSchema
): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  // BFS to traverse relationships transitively
  // Queue items: [tableId, rowIds to process]
  const queue: Array<{ table: Table; rowIds: string[] }> = [
    { table: sourceTable, rowIds: [sourceRow.id] },
  ];

  // Track visited table+row combinations to avoid infinite loops
  const visited = new Set<string>();
  visited.add(`${sourceTable.id}:${sourceRow.id}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const otherTable of schema.tables) {
      // Skip the current table in the queue entry (we already have those rows)
      if (otherTable.id === current.table.id) continue;

      for (const rowId of current.rowIds) {
        const row = current.table.rows.find((r) => r.id === rowId);
        if (!row) continue;

        const relatedIds = findRelatedRows(row, current.table, otherTable, schema.relationships);

        if (relatedIds.length > 0) {
          if (!result.has(otherTable.id)) {
            result.set(otherTable.id, new Set());
          }
          const tableSet = result.get(otherTable.id)!;

          const newIds: string[] = [];
          for (const id of relatedIds) {
            const key = `${otherTable.id}:${id}`;
            if (!visited.has(key)) {
              visited.add(key);
              tableSet.add(id);
              newIds.push(id);
            }
          }

          // Continue BFS with newly discovered rows
          if (newIds.length > 0) {
            queue.push({ table: otherTable, rowIds: newIds });
          }
        }
      }
    }
  }

  return result;
}

/**
 * Generate a unique ID string.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
