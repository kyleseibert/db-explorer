import { Outlet } from 'react-router';
import Sidebar from './Sidebar';

export default function AppShell() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
}
