import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Key,
  Link,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { studentEnrollment } from '../data/normalization-scenarios';
import DataTable from '../components/shared/DataTable';
import SqlDisplay from '../components/shared/SqlDisplay';
import InfoPanel from '../components/shared/InfoPanel';
import { generateCreateTableSql } from '../lib/sqlGenerator';
import type { Anomaly, NormalForm, Table } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Anomalies', '1NF', '2NF', '3NF'] as const;

const NORMAL_FORM_EXPLANATIONS: Record<string, { name: string; rule: string; plain: string }> = {
  '1NF': {
    name: 'First Normal Form',
    rule: 'Each cell contains a single value (no lists or repeating groups), and each row is unique.',
    plain:
      'Imagine a spreadsheet where one cell says "Math, Physics, Chemistry." That\'s a list crammed into one cell. 1NF says every cell should have exactly one value, so you\'d split that into three separate rows.',
  },
  '2NF': {
    name: 'Second Normal Form',
    rule: 'Must be in 1NF, plus every non-key column depends on the entire primary key (not just part of it).',
    plain:
      'If your table uses a combination of columns as its key (like student_id + course_id), then every other column should depend on both of those together. If a column only depends on one part (like student_name depending only on student_id), it should be moved to its own table.',
  },
  '3NF': {
    name: 'Third Normal Form',
    rule: 'Must be in 2NF, plus no non-key column depends on another non-key column (no transitive dependencies).',
    plain:
      'If knowing the professor tells you the department (because each professor belongs to one department), then department depends on professor, not on the primary key. Move it to a separate professor table to eliminate this indirect dependency.',
  },
};

function getCurrentForm(step: number): NormalForm {
  if (step === 0) return 'UNF';
  return studentEnrollment.steps[step - 1].toForm;
}

const FORM_BADGE_STYLES: Record<NormalForm, string> = {
  UNF: 'bg-danger-500/20 text-danger-300',
  '1NF': 'bg-warning-500/20 text-warning-400',
  '2NF': 'bg-primary-500/20 text-primary-400',
  '3NF': 'bg-success-500/20 text-success-500',
};

const ANOMALY_STYLES: Record<
  Anomaly['type'],
  { button: string; activeButton: string; border: string; icon: typeof Pencil }
> = {
  update: {
    button:
      'bg-warning-500/20 text-warning-400 border border-warning-500/30 hover:bg-warning-500/30',
    activeButton:
      'bg-warning-500/30 text-warning-400 border border-warning-500/50 ring-2 ring-warning-400/40',
    border: 'border-warning-500',
    icon: Pencil,
  },
  delete: {
    button:
      'bg-danger-500/20 text-danger-300 border border-danger-500/30 hover:bg-danger-500/30',
    activeButton:
      'bg-danger-500/30 text-danger-300 border border-danger-500/50 ring-2 ring-danger-300/40',
    border: 'border-danger-500',
    icon: Trash2,
  },
  insert: {
    button:
      'bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30',
    activeButton:
      'bg-primary-500/30 text-primary-400 border border-primary-500/50 ring-2 ring-primary-400/40',
    border: 'border-primary-500',
    icon: Plus,
  },
};

// ── Highlighted Table (custom render for anomaly cell highlighting) ─────

interface HighlightedTableProps {
  table: Table;
  affectedRowIds: Set<string>;
  affectedColumns: Set<string>;
}

function HighlightedTable({
  table,
  affectedRowIds,
  affectedColumns,
}: HighlightedTableProps) {
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
                  className="text-slate-300 text-xs uppercase tracking-wider px-4 py-3"
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
              const isRowAffected = affectedRowIds.has(row.id);
              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-b border-slate-700 transition-colors ${
                    isRowAffected
                      ? 'bg-danger-500/10'
                      : 'bg-slate-800 hover:bg-slate-700/50'
                  }`}
                >
                  {table.columns.map((col) => {
                    const value = row.cells[col.name];
                    const isCellHighlighted =
                      isRowAffected && affectedColumns.has(col.name);
                    return (
                      <td
                        key={col.id}
                        className={`text-sm font-mono px-4 py-2 ${
                          isCellHighlighted
                            ? 'bg-danger-200/20 ring-1 ring-danger-500/50 rounded-sm'
                            : ''
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

// ── Step Progress Indicator ────────────────────────────────────────────

interface StepProgressProps {
  currentStep: number;
}

function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-6 h-0.5 ${
                  i <= currentStep ? 'bg-primary-500' : 'bg-slate-600'
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-primary-500'
                    : isCurrent
                      ? 'bg-primary-500 ring-2 ring-primary-300'
                      : 'bg-slate-600'
                }`}
              />
              <span
                className={`text-[10px] whitespace-nowrap ${
                  isCurrent
                    ? 'text-primary-300 font-medium'
                    : isCompleted
                      ? 'text-primary-400'
                      : 'text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Normal Form Badge ──────────────────────────────────────────────────

function NormalFormBadge({ form }: { form: NormalForm }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${FORM_BADGE_STYLES[form]}`}
    >
      {form}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function NormalizationLabPage() {
  const scenario = studentEnrollment;
  const [currentStep, setCurrentStep] = useState(0);
  const [activeAnomaly, setActiveAnomaly] = useState<Anomaly | null>(null);

  const currentForm = getCurrentForm(currentStep);

  // Compute highlighted row IDs and column names for the active anomaly
  const highlightedCells = useMemo(() => {
    if (!activeAnomaly) {
      return { rowIds: new Set<string>(), columns: new Set<string>() };
    }
    const rowIds = new Set(
      activeAnomaly.affectedRows.map((idx) => scenario.initialTable.rows[idx].id)
    );
    const columns = new Set(activeAnomaly.affectedColumns);
    return { rowIds, columns };
  }, [activeAnomaly, scenario.initialTable.rows]);

  function handleAnomalyClick(anomaly: Anomaly) {
    if (activeAnomaly?.type === anomaly.type) {
      setActiveAnomaly(null);
    } else {
      setActiveAnomaly(anomaly);
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setActiveAnomaly(null);
      setCurrentStep((s) => s - 1);
    }
  }

  function handleNext() {
    if (currentStep < 3) {
      setActiveAnomaly(null);
      setCurrentStep((s) => s + 1);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Normalization Lab</h1>
          <NormalFormBadge form={currentForm} />
        </div>
        <StepProgress currentStep={currentStep} />
      </div>

      {/* Intro explanation */}
      <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4 space-y-3">
        <p className="text-sm text-slate-300 leading-relaxed">
          <span className="text-success-500 font-medium">Normalization</span> is the process of
          organizing a database to reduce redundancy (repeated data) and prevent errors. Imagine
          a single giant spreadsheet where every student enrollment duplicates the professor's
          office and department info — that's the kind of mess we'll clean up here.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          You'll walk through four steps: first, see the <span className="text-white font-medium">problems
          (anomalies)</span> caused by a poorly structured table, then progressively split it
          into cleaner tables through{' '}
          <span className="text-warning-400 font-medium">1NF</span>,{' '}
          <span className="text-primary-300 font-medium">2NF</span>, and{' '}
          <span className="text-success-500 font-medium">3NF</span>. Use the{' '}
          <span className="text-slate-400">Previous</span> and{' '}
          <span className="text-slate-400">Next</span> buttons to navigate between steps.
        </p>
      </div>

      {/* ── Step Content (animated) ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {currentStep === 0 ? (
            <AnomalyExplorer
              scenario={scenario}
              activeAnomaly={activeAnomaly}
              highlightedCells={highlightedCells}
              onAnomalyClick={handleAnomalyClick}
            />
          ) : (
            <NormalizationStepView
              step={scenario.steps[currentStep - 1]}
              stepIndex={currentStep}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-slate-400">
          Step {currentStep + 1} of 4
        </span>
        <button
          onClick={handleNext}
          disabled={currentStep === 3}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Anomaly Explorer (Step 0) ──────────────────────────────────────────

interface AnomalyExplorerProps {
  scenario: typeof studentEnrollment;
  activeAnomaly: Anomaly | null;
  highlightedCells: { rowIds: Set<string>; columns: Set<string> };
  onAnomalyClick: (anomaly: Anomaly) => void;
}

function AnomalyExplorer({
  scenario,
  activeAnomaly,
  highlightedCells,
  onAnomalyClick,
}: AnomalyExplorerProps) {
  const hasHighlighting =
    activeAnomaly &&
    (highlightedCells.rowIds.size > 0 || highlightedCells.columns.size > 0);

  return (
    <div className="space-y-6">
      {/* Table -- render custom highlighted table if anomaly is active with highlights */}
      {hasHighlighting ? (
        <HighlightedTable
          table={scenario.initialTable}
          affectedRowIds={highlightedCells.rowIds}
          affectedColumns={highlightedCells.columns}
        />
      ) : (
        <DataTable table={scenario.initialTable} />
      )}

      {/* Anomaly Buttons */}
      <div className="flex flex-wrap gap-3">
        {scenario.anomalies.map((anomaly) => {
          const styles = ANOMALY_STYLES[anomaly.type];
          const isActive = activeAnomaly?.type === anomaly.type;
          const Icon = styles.icon;
          return (
            <button
              key={anomaly.type}
              onClick={() => onAnomalyClick(anomaly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive ? styles.activeButton : styles.button
              }`}
            >
              <Icon className="w-4 h-4" />
              {anomaly.title}
            </button>
          );
        })}
      </div>

      {/* Active Anomaly Description */}
      <AnimatePresence>
        {activeAnomaly && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={`bg-slate-800 border-l-4 ${ANOMALY_STYLES[activeAnomaly.type].border} p-4 rounded-r-lg`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">
                    {activeAnomaly.type.charAt(0).toUpperCase() +
                      activeAnomaly.type.slice(1)}{' '}
                    Anomaly
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {activeAnomaly.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction */}
      <p className="text-xs text-slate-500">
        Click the anomaly buttons above to highlight the affected cells in the table. Click a
        button again to clear the highlighting.
      </p>

      {/* Info Panel */}
      <InfoPanel title="What are data anomalies?" defaultOpen>
        <div className="space-y-3">
          <p className="text-slate-300">
            Data anomalies are problems that happen when the same information is stored in
            multiple places. They're the main reason we normalize databases — to prevent these
            errors from being possible in the first place.
          </p>
          <div className="space-y-3">
            <div className="bg-warning-500/5 border border-warning-500/20 rounded-lg p-3">
              <p className="text-warning-400 font-medium text-sm mb-1">Update Anomaly</p>
              <p className="text-xs text-slate-400">
                When the same fact is stored in many rows, updating it means changing every
                copy. If you miss one, the data becomes inconsistent. For example, if Prof.
                Smith changes offices, you'd need to update every row where she appears — miss
                one and the database disagrees with itself.
              </p>
            </div>
            <div className="bg-danger-500/5 border border-danger-500/20 rounded-lg p-3">
              <p className="text-danger-300 font-medium text-sm mb-1">Delete Anomaly</p>
              <p className="text-xs text-slate-400">
                Removing a row might accidentally delete information you still need. If a student
                drops their only course, you lose the professor and department data too — even
                though that information has nothing to do with the student.
              </p>
            </div>
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
              <p className="text-primary-400 font-medium text-sm mb-1">Insert Anomaly</p>
              <p className="text-xs text-slate-400">
                You can't add certain information without also adding unrelated data. Want to
                record a new professor? You can't unless you also invent a student and course
                enrollment to go with it, because all the data is jammed into one table.
              </p>
            </div>
          </div>
        </div>
      </InfoPanel>
    </div>
  );
}

// ── Normalization Step View (Steps 1-3) ─────────────────────────────────

interface NormalizationStepViewProps {
  step: (typeof studentEnrollment.steps)[number];
  stepIndex: number;
}

function NormalizationStepView({ step, stepIndex }: NormalizationStepViewProps) {
  // Identify which tables are "new" in the after set (not present in before)
  const beforeTableIds = new Set(step.beforeTables.map((t) => t.name));
  const formExplanation = NORMAL_FORM_EXPLANATIONS[step.toForm];

  return (
    <div className="space-y-6">
      {/* Normal form explanation */}
      {formExplanation && (
        <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4 space-y-2">
          <h3 className="text-white font-semibold text-sm">
            {formExplanation.name} ({step.toForm})
          </h3>
          <p className="text-xs text-primary-300 font-medium">
            Rule: {formExplanation.rule}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {formExplanation.plain}
          </p>
        </div>
      )}

      {/* Before Tables */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Before
          </span>
          <NormalFormBadge form={step.fromForm} />
        </div>
        <div className="flex flex-wrap gap-4">
          {step.beforeTables.map((table) => (
            <div key={table.id} className="flex-1 min-w-[280px]">
              <DataTable table={table} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Transformation Arrow */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="h-px flex-1 bg-slate-700" />
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
          <ArrowDown className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-medium text-primary-300">
            {step.title}
          </span>
        </div>
        <div className="h-px flex-1 bg-slate-700" />
      </div>

      {/* After Tables */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            After
          </span>
          <NormalFormBadge form={step.toForm} />
        </div>
        <div className="flex flex-wrap gap-4">
          {step.afterTables.map((table) => {
            const isNew = !beforeTableIds.has(table.name);
            return (
              <motion.div
                key={table.id}
                className="flex-1 min-w-[280px]"
                initial={isNew ? { opacity: 0, scale: 0.95 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: isNew ? 0.2 : 0 }}
              >
                <div className="relative">
                  {isNew && (
                    <span className="absolute -top-2 -right-2 bg-success-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      NEW
                    </span>
                  )}
                  <DataTable table={table} compact />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Problem Callout */}
      <div className="bg-warning-500/10 border-l-4 border-warning-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-1">Problem</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {step.problem}
            </p>
          </div>
        </div>
      </div>

      {/* Explanation Info Panel */}
      <InfoPanel
        title={`Step ${stepIndex}: ${step.title}`}
        defaultOpen
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
          <p>{step.explanation}</p>
        </div>
      </InfoPanel>

      {/* SQL for after tables */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Resulting Schema
        </h4>
        {step.afterTables.map((table) => (
          <SqlDisplay
            key={table.id}
            sql={generateCreateTableSql(table)}
            title={table.name}
          />
        ))}
      </div>
    </div>
  );
}
