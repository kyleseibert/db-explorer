import type { Table, JoinType, JoinResult, JoinResultRow, Row } from '../types';
import { generateJoinSql } from './sqlGenerator';

/**
 * Compute the result of joining two tables on the specified columns.
 *
 * Returns matched/unmatched rows depending on the join type, along with
 * tracking sets for which rows participated in matches and the generated SQL.
 */
export function computeJoin(
  leftTable: Table,
  rightTable: Table,
  leftColumnId: string,
  rightColumnId: string,
  joinType: JoinType
): JoinResult {
  const matchedLeftIds = new Set<string>();
  const matchedRightIds = new Set<string>();
  const resultRows: JoinResultRow[] = [];
  let delay = 0;

  const leftColumn = leftTable.columns.find((c) => c.id === leftColumnId);
  const rightColumn = rightTable.columns.find((c) => c.id === rightColumnId);

  const leftKey = leftColumn?.name ?? leftColumnId;
  const rightKey = rightColumn?.name ?? rightColumnId;

  // Helper: check if two cell values match (loose equality for cross-type comparisons)
  function valuesMatch(
    a: string | number | boolean | null,
    b: string | number | boolean | null
  ): boolean {
    if (a === null || b === null) return false;
    // Compare as strings to handle number/string mismatches in cell data
    return String(a) === String(b);
  }

  // Helper: push a result row with auto-incrementing animation delay
  function pushRow(leftRow: Row | null, rightRow: Row | null, isMatched: boolean): void {
    resultRows.push({ leftRow, rightRow, isMatched, animationDelay: delay });
    delay += 0.1;
  }

  if (joinType === 'CROSS') {
    // CROSS JOIN: every combination of left and right rows
    for (const leftRow of leftTable.rows) {
      for (const rightRow of rightTable.rows) {
        matchedLeftIds.add(leftRow.id);
        matchedRightIds.add(rightRow.id);
        pushRow(leftRow, rightRow, true);
      }
    }
  } else {
    // For INNER, LEFT, RIGHT, and FULL_OUTER we first compute matched pairs
    for (const leftRow of leftTable.rows) {
      const leftVal = leftRow.cells[leftKey] ?? null;
      let hasMatch = false;

      for (const rightRow of rightTable.rows) {
        const rightVal = rightRow.cells[rightKey] ?? null;

        if (valuesMatch(leftVal, rightVal)) {
          matchedLeftIds.add(leftRow.id);
          matchedRightIds.add(rightRow.id);
          pushRow(leftRow, rightRow, true);
          hasMatch = true;
        }
      }

      // LEFT JOIN and FULL OUTER JOIN include unmatched left rows
      if (!hasMatch && (joinType === 'LEFT' || joinType === 'FULL_OUTER')) {
        pushRow(leftRow, null, false);
      }
    }

    // RIGHT JOIN and FULL OUTER JOIN include unmatched right rows
    if (joinType === 'RIGHT' || joinType === 'FULL_OUTER') {
      for (const rightRow of rightTable.rows) {
        if (!matchedRightIds.has(rightRow.id)) {
          pushRow(null, rightRow, false);
        }
      }
    }

    // For INNER JOIN, no extra rows needed — only matched pairs were added
  }

  const sql = generateJoinSql(leftTable, rightTable, leftColumnId, rightColumnId, joinType);

  return {
    rows: resultRows,
    matchedLeftIds,
    matchedRightIds,
    sql,
  };
}
