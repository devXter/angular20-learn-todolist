import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () => import('./features/task-manager/task-manager').then((m) => m.TaskManager),
  },
  { path: '**', redirectTo: 'tasks', pathMatch: 'full' },
];
