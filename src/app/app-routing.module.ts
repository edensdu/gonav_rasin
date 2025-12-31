import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'public',
    loadChildren: () => import('./pages/public/public.module').then(m => m.PublicPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'groups',
    loadChildren: () => import('./pages/groups/groups.module').then(m => m.GroupsPageModule)
  },
  {
    path: 'group-detail/:id',
    loadChildren: () => import('./pages/group-detail/group-detail.module').then(m => m.GroupDetailPageModule)
  },
  {
    path: 'members/:groupId',
    loadChildren: () => import('./pages/members/members.module').then(m => m.MembersPageModule)
  },
  {
    path: 'contributions/:groupId',
    loadChildren: () => import('./pages/contributions/contributions.module').then(m => m.ContributionsPageModule)
  },
  {
    path: 'loans/:groupId',
    loadChildren: () => import('./pages/loans/loans.module').then(m => m.LoansPageModule)
  },
  {
    path: 'leadership',
    loadChildren: () => import('./pages/leadership/leadership.module').then(m => m.LeadershipPageModule)
  },
  {
    path: 'training',
    loadChildren: () => import('./pages/training/training.module').then(m => m.TrainingPageModule)
  },
  {
    path: '**',
    redirectTo: 'public'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
