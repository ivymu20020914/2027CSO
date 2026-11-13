import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import DashboardPage from './pages/dashboard/DashboardPage';
import TasksPage from './pages/tasks/TasksPage';
import ModuleDetailPage from './pages/module-detail/ModuleDetailPage';
import NoticesPage from './pages/notices/NoticesPage';
import DecisionsPage from './pages/decisions/DecisionsPage';
import TeamPage from './pages/team/TeamPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="decisions" element={<DecisionsPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
