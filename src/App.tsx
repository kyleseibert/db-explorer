import { BrowserRouter, Routes, Route } from 'react-router';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import TableExplorerPage from './pages/TableExplorerPage';
import JoinVisualizerPage from './pages/JoinVisualizerPage';
import NormalizationLabPage from './pages/NormalizationLabPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Landing />} />
          <Route path="table-explorer" element={<TableExplorerPage />} />
          <Route path="join-visualizer" element={<JoinVisualizerPage />} />
          <Route path="normalization" element={<NormalizationLabPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
