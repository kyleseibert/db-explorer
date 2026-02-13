export type ColumnType = 'INTEGER' | 'TEXT' | 'DATE' | 'BOOLEAN' | 'DECIMAL';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyRef?: {
    tableId: string;
    columnId: string;
  };
  isNullable: boolean;
}

export interface Row {
  id: string;
  cells: Record<string, string | number | boolean | null>;
}

export type CellValue = string | number | boolean | null;

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: Row[];
  position?: { x: number; y: number };
}

export interface ForeignKeyRelationship {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  type: '1:1' | '1:N' | 'M:N';
}

export interface DatabaseSchema {
  tables: Table[];
  relationships: ForeignKeyRelationship[];
}

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL_OUTER' | 'CROSS';

export interface JoinConfig {
  leftTableId: string;
  rightTableId: string;
  leftColumnId: string;
  rightColumnId: string;
  joinType: JoinType;
}

export interface JoinResultRow {
  leftRow: Row | null;
  rightRow: Row | null;
  isMatched: boolean;
  animationDelay: number;
}

export interface JoinResult {
  rows: JoinResultRow[];
  matchedLeftIds: Set<string>;
  matchedRightIds: Set<string>;
  sql: string;
}

export type NormalForm = 'UNF' | '1NF' | '2NF' | '3NF';

export interface Anomaly {
  type: 'update' | 'delete' | 'insert';
  title: string;
  description: string;
  affectedRows: number[];
  affectedColumns: string[];
}

export interface NormalizationStep {
  fromForm: NormalForm;
  toForm: NormalForm;
  title: string;
  explanation: string;
  problem: string;
  beforeTables: Table[];
  afterTables: Table[];
}

export interface NormalizationScenario {
  id: string;
  name: string;
  description: string;
  initialTable: Table;
  steps: NormalizationStep[];
  anomalies: Anomaly[];
}
