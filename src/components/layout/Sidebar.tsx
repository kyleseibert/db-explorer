import { NavLink } from 'react-router';
import { Database, TableProperties, GitMerge, Layers, Box } from 'lucide-react';

const navItems = [
  { to: '/table-explorer', icon: TableProperties, label: 'Table Explorer' },
  { to: '/join-visualizer', icon: GitMerge, label: 'Join Visualizer' },
  { to: '/normalization', icon: Layers, label: 'Normalization Lab' },
  { to: '/3d-view', icon: Box, label: '3D Landscape' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <Database className="w-6 h-6 text-primary-400" />
        <h1 className="text-xl font-bold text-white">DB Explorer</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border-l-2 border-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
