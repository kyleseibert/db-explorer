import type { NormalizationScenario, Table } from '../types';

const initialTable: Table = {
  id: 'student_enrollment_unnormalized',
  name: 'StudentEnrollment',
  columns: [
    { id: 'student_id', name: 'student_id', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'student_name', name: 'student_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'courses', name: 'courses', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'department', name: 'department', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'dept_phone', name: 'dept_phone', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'professor', name: 'professor', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'prof_office', name: 'prof_office', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'row-0', cells: { student_id: '1', student_name: 'Alice', courses: 'Math, Physics', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 'row-1', cells: { student_id: '2', student_name: 'Bob', courses: 'Math, English', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 'row-2', cells: { student_id: '3', student_name: 'Charlie', courses: 'English, Art', department: 'Arts', dept_phone: '555-0200', professor: 'Dr. Jones', prof_office: 'Room 305' } },
    { id: 'row-3', cells: { student_id: '4', student_name: 'Diana', courses: 'Physics, Chemistry', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 'row-4', cells: { student_id: '5', student_name: 'Eve', courses: 'Art, Music', department: 'Arts', dept_phone: '555-0200', professor: 'Dr. Jones', prof_office: 'Room 305' } },
    { id: 'row-5', cells: { student_id: '6', student_name: 'Frank', courses: 'Chemistry', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Brown', prof_office: 'Room 102' } },
  ],
};

// ── Step 1 afterTables: UNF → 1NF ──────────────────────────────────────────

const students1NF: Table = {
  id: 'students_1nf',
  name: 'Students',
  columns: [
    { id: 'student_id', name: 'student_id', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'student_name', name: 'student_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'department', name: 'department', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'dept_phone', name: 'dept_phone', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'professor', name: 'professor', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'prof_office', name: 'prof_office', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 's1nf-1', cells: { student_id: '1', student_name: 'Alice', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 's1nf-2', cells: { student_id: '2', student_name: 'Bob', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 's1nf-3', cells: { student_id: '3', student_name: 'Charlie', department: 'Arts', dept_phone: '555-0200', professor: 'Dr. Jones', prof_office: 'Room 305' } },
    { id: 's1nf-4', cells: { student_id: '4', student_name: 'Diana', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 's1nf-5', cells: { student_id: '5', student_name: 'Eve', department: 'Arts', dept_phone: '555-0200', professor: 'Dr. Jones', prof_office: 'Room 305' } },
    { id: 's1nf-6', cells: { student_id: '6', student_name: 'Frank', department: 'Science', dept_phone: '555-0100', professor: 'Dr. Brown', prof_office: 'Room 102' } },
  ],
};

const enrollments1NF: Table = {
  id: 'enrollments_1nf',
  name: 'Enrollments',
  columns: [
    { id: 'enrollment_id', name: 'enrollment_id', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'student_id', name: 'student_id', type: 'TEXT', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'students_1nf', columnId: 'student_id' }, isNullable: false },
    { id: 'course_name', name: 'course_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'e1nf-1', cells: { enrollment_id: '1', student_id: '1', course_name: 'Math' } },
    { id: 'e1nf-2', cells: { enrollment_id: '2', student_id: '1', course_name: 'Physics' } },
    { id: 'e1nf-3', cells: { enrollment_id: '3', student_id: '2', course_name: 'Math' } },
    { id: 'e1nf-4', cells: { enrollment_id: '4', student_id: '2', course_name: 'English' } },
    { id: 'e1nf-5', cells: { enrollment_id: '5', student_id: '3', course_name: 'English' } },
    { id: 'e1nf-6', cells: { enrollment_id: '6', student_id: '3', course_name: 'Art' } },
    { id: 'e1nf-7', cells: { enrollment_id: '7', student_id: '4', course_name: 'Physics' } },
    { id: 'e1nf-8', cells: { enrollment_id: '8', student_id: '4', course_name: 'Chemistry' } },
    { id: 'e1nf-9', cells: { enrollment_id: '9', student_id: '5', course_name: 'Art' } },
    { id: 'e1nf-10', cells: { enrollment_id: '10', student_id: '5', course_name: 'Music' } },
    { id: 'e1nf-11', cells: { enrollment_id: '11', student_id: '6', course_name: 'Chemistry' } },
  ],
};

// ── Step 2 afterTables: 1NF → 2NF ──────────────────────────────────────────

const students2NF: Table = {
  id: 'students_2nf',
  name: 'Students',
  columns: [
    { id: 'student_id', name: 'student_id', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'student_name', name: 'student_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'department', name: 'department', type: 'TEXT', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'departments_2nf', columnId: 'department' }, isNullable: false },
  ],
  rows: [
    { id: 's2nf-1', cells: { student_id: '1', student_name: 'Alice', department: 'Science' } },
    { id: 's2nf-2', cells: { student_id: '2', student_name: 'Bob', department: 'Science' } },
    { id: 's2nf-3', cells: { student_id: '3', student_name: 'Charlie', department: 'Arts' } },
    { id: 's2nf-4', cells: { student_id: '4', student_name: 'Diana', department: 'Science' } },
    { id: 's2nf-5', cells: { student_id: '5', student_name: 'Eve', department: 'Arts' } },
    { id: 's2nf-6', cells: { student_id: '6', student_name: 'Frank', department: 'Science' } },
  ],
};

const departments2NF: Table = {
  id: 'departments_2nf',
  name: 'Departments',
  columns: [
    { id: 'department', name: 'department', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'dept_phone', name: 'dept_phone', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'professor', name: 'professor', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'prof_office', name: 'prof_office', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'd2nf-1', cells: { department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 'd2nf-2', cells: { department: 'Arts', dept_phone: '555-0200', professor: 'Dr. Jones', prof_office: 'Room 305' } },
  ],
};

const enrollments2NF: Table = {
  id: 'enrollments_2nf',
  name: 'Enrollments',
  columns: [
    { id: 'enrollment_id', name: 'enrollment_id', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'student_id', name: 'student_id', type: 'TEXT', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'students_2nf', columnId: 'student_id' }, isNullable: false },
    { id: 'course_name', name: 'course_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'e2nf-1', cells: { enrollment_id: '1', student_id: '1', course_name: 'Math' } },
    { id: 'e2nf-2', cells: { enrollment_id: '2', student_id: '1', course_name: 'Physics' } },
    { id: 'e2nf-3', cells: { enrollment_id: '3', student_id: '2', course_name: 'Math' } },
    { id: 'e2nf-4', cells: { enrollment_id: '4', student_id: '2', course_name: 'English' } },
    { id: 'e2nf-5', cells: { enrollment_id: '5', student_id: '3', course_name: 'English' } },
    { id: 'e2nf-6', cells: { enrollment_id: '6', student_id: '3', course_name: 'Art' } },
    { id: 'e2nf-7', cells: { enrollment_id: '7', student_id: '4', course_name: 'Physics' } },
    { id: 'e2nf-8', cells: { enrollment_id: '8', student_id: '4', course_name: 'Chemistry' } },
    { id: 'e2nf-9', cells: { enrollment_id: '9', student_id: '5', course_name: 'Art' } },
    { id: 'e2nf-10', cells: { enrollment_id: '10', student_id: '5', course_name: 'Music' } },
    { id: 'e2nf-11', cells: { enrollment_id: '11', student_id: '6', course_name: 'Chemistry' } },
  ],
};

// ── Step 3 afterTables: 2NF → 3NF ──────────────────────────────────────────

const students3NF: Table = {
  id: 'students_3nf',
  name: 'Students',
  columns: [
    { id: 'student_id', name: 'student_id', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'student_name', name: 'student_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'department', name: 'department', type: 'TEXT', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'departments_3nf', columnId: 'department' }, isNullable: false },
  ],
  rows: [
    { id: 's3nf-1', cells: { student_id: '1', student_name: 'Alice', department: 'Science' } },
    { id: 's3nf-2', cells: { student_id: '2', student_name: 'Bob', department: 'Science' } },
    { id: 's3nf-3', cells: { student_id: '3', student_name: 'Charlie', department: 'Arts' } },
    { id: 's3nf-4', cells: { student_id: '4', student_name: 'Diana', department: 'Science' } },
    { id: 's3nf-5', cells: { student_id: '5', student_name: 'Eve', department: 'Arts' } },
    { id: 's3nf-6', cells: { student_id: '6', student_name: 'Frank', department: 'Science' } },
  ],
};

const departments3NF: Table = {
  id: 'departments_3nf',
  name: 'Departments',
  columns: [
    { id: 'department', name: 'department', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'dept_phone', name: 'dept_phone', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'professor', name: 'professor', type: 'TEXT', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'professors_3nf', columnId: 'professor' }, isNullable: false },
  ],
  rows: [
    { id: 'd3nf-1', cells: { department: 'Science', dept_phone: '555-0100', professor: 'Dr. Smith' } },
    { id: 'd3nf-2', cells: { department: 'Arts', dept_phone: '555-0200', professor: 'Dr. Jones' } },
  ],
};

const professors3NF: Table = {
  id: 'professors_3nf',
  name: 'Professors',
  columns: [
    { id: 'professor', name: 'professor', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'prof_office', name: 'prof_office', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'p3nf-1', cells: { professor: 'Dr. Smith', prof_office: 'Room 201' } },
    { id: 'p3nf-2', cells: { professor: 'Dr. Jones', prof_office: 'Room 305' } },
    { id: 'p3nf-3', cells: { professor: 'Dr. Brown', prof_office: 'Room 102' } },
  ],
};

const enrollments3NF: Table = {
  id: 'enrollments_3nf',
  name: 'Enrollments',
  columns: [
    { id: 'enrollment_id', name: 'enrollment_id', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'student_id', name: 'student_id', type: 'TEXT', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'students_3nf', columnId: 'student_id' }, isNullable: false },
    { id: 'course_name', name: 'course_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'e3nf-1', cells: { enrollment_id: '1', student_id: '1', course_name: 'Math' } },
    { id: 'e3nf-2', cells: { enrollment_id: '2', student_id: '1', course_name: 'Physics' } },
    { id: 'e3nf-3', cells: { enrollment_id: '3', student_id: '2', course_name: 'Math' } },
    { id: 'e3nf-4', cells: { enrollment_id: '4', student_id: '2', course_name: 'English' } },
    { id: 'e3nf-5', cells: { enrollment_id: '5', student_id: '3', course_name: 'English' } },
    { id: 'e3nf-6', cells: { enrollment_id: '6', student_id: '3', course_name: 'Art' } },
    { id: 'e3nf-7', cells: { enrollment_id: '7', student_id: '4', course_name: 'Physics' } },
    { id: 'e3nf-8', cells: { enrollment_id: '8', student_id: '4', course_name: 'Chemistry' } },
    { id: 'e3nf-9', cells: { enrollment_id: '9', student_id: '5', course_name: 'Art' } },
    { id: 'e3nf-10', cells: { enrollment_id: '10', student_id: '5', course_name: 'Music' } },
    { id: 'e3nf-11', cells: { enrollment_id: '11', student_id: '6', course_name: 'Chemistry' } },
  ],
};

// ── Scenario Export ─────────────────────────────────────────────────────────

export const studentEnrollment: NormalizationScenario = {
  id: 'student-enrollment',
  name: 'Student Enrollment',
  description: 'A denormalized student enrollment table that contains repeating groups, partial dependencies, and transitive dependencies. Walk through the normalization process from UNF to 3NF.',
  initialTable,
  anomalies: [
    {
      type: 'update',
      title: 'Change the Science department phone number',
      description: 'The Science department phone number "555-0100" is duplicated across four rows. Updating it requires changing every row where department is Science, risking inconsistency if any row is missed.',
      affectedRows: [0, 1, 3, 5],
      affectedColumns: ['dept_phone'],
    },
    {
      type: 'delete',
      title: 'Delete Frank (the only Chemistry-only student)',
      description: 'Frank is the only student enrolled solely in Chemistry. Deleting his row also removes the fact that Dr. Brown\'s office is Room 102, losing professor information unrelated to the student.',
      affectedRows: [5],
      affectedColumns: ['student_id', 'student_name', 'courses', 'department', 'dept_phone', 'professor', 'prof_office'],
    },
    {
      type: 'insert',
      title: 'Add a new department "Engineering" with no students yet',
      description: 'There is no way to record a new department (e.g., Engineering with phone 555-0300) without also inserting a student, because student_id is the primary key and cannot be null.',
      affectedRows: [],
      affectedColumns: [],
    },
  ],
  steps: [
    {
      fromForm: 'UNF',
      toForm: '1NF',
      title: 'Eliminate Repeating Groups',
      problem: "The 'courses' column contains comma-separated values, violating first normal form.",
      explanation: 'Each cell should contain exactly one value. We split multi-value cells into separate rows, creating a proper Enrollments table.',
      beforeTables: [initialTable],
      afterTables: [students1NF, enrollments1NF],
    },
    {
      fromForm: '1NF',
      toForm: '2NF',
      title: 'Remove Partial Dependencies',
      problem: "In the Students table, department/dept_phone/professor/prof_office don't depend on student_id alone — they depend on department.",
      explanation: "We separate data that doesn't fully depend on the primary key into its own table.",
      beforeTables: [students1NF, enrollments1NF],
      afterTables: [students2NF, departments2NF, enrollments2NF],
    },
    {
      fromForm: '2NF',
      toForm: '3NF',
      title: 'Remove Transitive Dependencies',
      problem: 'In Departments, prof_office depends on professor, not directly on department. This is a transitive dependency.',
      explanation: 'We extract professor information into its own table to eliminate the chain: department -> professor -> prof_office.',
      beforeTables: [students2NF, departments2NF, enrollments2NF],
      afterTables: [students3NF, departments3NF, professors3NF, enrollments3NF],
    },
  ],
};
