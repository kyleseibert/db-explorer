import { Link } from 'react-router';
import { TableProperties, GitMerge, Layers, BookOpen, Box } from 'lucide-react';

const labs = [
  {
    to: '/table-explorer',
    icon: TableProperties,
    iconBg: 'bg-primary-500/20',
    iconColor: 'text-primary-400',
    title: 'Table Explorer',
    description:
      'See how databases store information in tables and how those tables connect to each other through keys.',
    concepts: ['Tables, rows, and columns', 'Primary keys and foreign keys', 'One-to-many relationships', 'ER diagrams and SQL schemas'],
  },
  {
    to: '/join-visualizer',
    icon: GitMerge,
    iconBg: 'bg-accent-500/20',
    iconColor: 'text-accent-400',
    title: 'Join Visualizer',
    description:
      'Watch step-by-step as SQL joins combine data from two tables, with animations showing exactly which rows match.',
    concepts: ['INNER, LEFT, RIGHT, and FULL joins', 'How matched vs. unmatched rows work', 'NULL values in join results', 'Venn diagram representations'],
  },
  {
    to: '/normalization',
    icon: Layers,
    iconBg: 'bg-success-500/20',
    iconColor: 'text-success-500',
    title: 'Normalization Lab',
    description:
      'Start with a messy spreadsheet and clean it up step by step, learning why good database design prevents data problems.',
    concepts: ['Data anomalies (update, delete, insert)', 'First, Second, and Third Normal Form', 'Splitting tables to reduce redundancy', 'Functional dependencies'],
  },
  {
    to: '/3d-view',
    icon: Box,
    iconBg: 'bg-accent-500/20',
    iconColor: 'text-accent-400',
    title: '3D Table Landscape',
    description:
      'Explore database tables as floating 3D panels in an interactive scene with glowing foreign key connections.',
    concepts: ['Tables as 3D objects in space', 'Foreign key connections as glowing lines', 'Interactive row highlighting across tables', 'Spatial understanding of database structure'],
  },
];

export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">DB Explorer</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Learn relational databases visually. Each lab below teaches a core
          concept through hands-on, interactive examples — no prior database
          experience required.
        </p>
      </div>

      {/* What is a relational database? */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6 mb-10">
        <div className="flex items-start gap-3 mb-3">
          <BookOpen className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
          <h2 className="text-lg font-semibold text-white">What is a relational database?</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed ml-8">
          A relational database stores data in <span className="text-primary-300 font-medium">tables</span> (like
          spreadsheets). Each table has <span className="text-primary-300 font-medium">columns</span> that define
          what kind of data is stored, and <span className="text-primary-300 font-medium">rows</span> that hold
          individual records. Tables can reference each other through special columns called{' '}
          <span className="text-primary-300 font-medium">keys</span>, which is what makes them "relational" — the
          data in one table relates to data in another. SQL (Structured Query Language) is the
          language used to ask questions about and combine data across these tables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {labs.map(({ to, icon: Icon, iconBg, iconColor, title, description, concepts }) => (
          <Link
            key={to}
            to={to}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-primary-400/50 transition cursor-pointer group"
          >
            <div
              className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mb-4`}
            >
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
            <p className="text-sm text-slate-400 mb-4">{description}</p>
            <ul className="space-y-1 mb-5">
              {concepts.map((concept) => (
                <li key={concept} className="text-xs text-slate-500 flex items-start gap-2">
                  <span className="text-slate-600 mt-1">&#8226;</span>
                  {concept}
                </li>
              ))}
            </ul>
            <span className="text-sm text-primary-400 font-medium group-hover:text-primary-300 transition-colors">
              Start Lab &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
