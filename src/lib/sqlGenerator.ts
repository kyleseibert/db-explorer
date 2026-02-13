import type { Table, JoinType } from '../types';

const JOIN_TYPE_SQL: Record<JoinType, string> = {
  INNER: 'INNER JOIN',
  LEFT: 'LEFT JOIN',
  RIGHT: 'RIGHT JOIN',
  FULL_OUTER: 'FULL OUTER JOIN',
  CROSS: 'CROSS JOIN',
};

export function generateCreateTableSql(table: Table): string {
  const columnDefs: string[] = [];
  const primaryKeys: string[] = [];
  const foreignKeys: string[] = [];

  for (const col of table.columns) {
    columnDefs.push(`  ${col.name} ${col.type}`);

    if (col.isPrimaryKey) {
      primaryKeys.push(col.name);
    }

    if (col.isForeignKey && col.foreignKeyRef) {
      // We need to resolve the referenced table and column names.
      // Since we only have IDs here but not the full schema, we store
      // the reference IDs as placeholders. The caller can resolve them
      // if needed, but for display purposes we use the IDs directly.
      foreignKeys.push(
        `  FOREIGN KEY (${col.name}) REFERENCES ${col.foreignKeyRef.tableId}(${col.foreignKeyRef.columnId})`
      );
    }
  }

  if (primaryKeys.length > 0) {
    columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
  }

  const allDefs = [...columnDefs, ...foreignKeys];

  return `CREATE TABLE ${table.name} (\n${allDefs.join(',\n')}\n);`;
}

/**
 * Generate a SQL string for a CREATE TABLE statement, resolving foreign key
 * references to actual table/column names using a lookup map.
 */
export function generateCreateTableSqlWithNames(
  table: Table,
  tableNameMap: Map<string, string>,
  columnNameMap: Map<string, string>
): string {
  const columnDefs: string[] = [];
  const primaryKeys: string[] = [];
  const foreignKeys: string[] = [];

  for (const col of table.columns) {
    columnDefs.push(`  ${col.name} ${col.type}`);

    if (col.isPrimaryKey) {
      primaryKeys.push(col.name);
    }

    if (col.isForeignKey && col.foreignKeyRef) {
      const refTableName = tableNameMap.get(col.foreignKeyRef.tableId) ?? col.foreignKeyRef.tableId;
      const refColumnName = columnNameMap.get(col.foreignKeyRef.columnId) ?? col.foreignKeyRef.columnId;
      foreignKeys.push(
        `  FOREIGN KEY (${col.name}) REFERENCES ${refTableName}(${refColumnName})`
      );
    }
  }

  if (primaryKeys.length > 0) {
    columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
  }

  const allDefs = [...columnDefs, ...foreignKeys];

  return `CREATE TABLE ${table.name} (\n${allDefs.join(',\n')}\n);`;
}

export function generateJoinSql(
  leftTable: Table,
  rightTable: Table,
  leftColumnId: string,
  rightColumnId: string,
  joinType: JoinType
): string {
  const leftColumn = leftTable.columns.find((c) => c.id === leftColumnId);
  const rightColumn = rightTable.columns.find((c) => c.id === rightColumnId);

  const leftColName = leftColumn?.name ?? leftColumnId;
  const rightColName = rightColumn?.name ?? rightColumnId;

  const joinKeyword = JOIN_TYPE_SQL[joinType];

  if (joinType === 'CROSS') {
    return `SELECT *\nFROM ${leftTable.name}\n${joinKeyword} ${rightTable.name};`;
  }

  return (
    `SELECT *\nFROM ${leftTable.name}\n${joinKeyword} ${rightTable.name}\n` +
    `  ON ${leftTable.name}.${leftColName} = ${rightTable.name}.${rightColName};`
  );
}
