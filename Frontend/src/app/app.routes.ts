import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        m => m.DashboardComponent
      ),
    title: 'Pulpit — SignalHub',
  },
  {
    path: 'spolki',
    loadComponent: () =>
      import('./features/company-list/company-list.component').then(
        m => m.CompanyListComponent
      ),
    title: 'Spółki GPW',
  },
  {
    path: 'news',
    loadComponent: () =>
      import('./features/news-list/news-list.component').then(
        m => m.NewsListComponent
      ),
    title: 'Newsy — SignalHub',
  },
  {
    path: 'company/:isin/news',
    loadComponent: () =>
      import('./features/news-list/news-list.component').then(
        m => m.NewsListComponent
      ),
    title: 'Newsy spółki — SignalHub',
  },
  {
    path: 'company/:isin',
    loadComponent: () =>
      import('./features/company-view/company-view.component').then(
        m => m.CompanyViewComponent
      ),
    title: 'Spółka — SignalHub',
  },
  {
    path: 'company/:isin/admin',
    loadComponent: () =>
      import('./features/company-admin/company-admin.component').then(
        m => m.CompanyAdminComponent
      ),
    title: 'Admin — SignalHub',
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./features/article-view/article-view.component').then(
        m => m.ArticleViewComponent
      ),
    title: 'Artykuł — SignalHub',
  },
  {
    path: 'import',
    loadComponent: () =>
      import('./features/import/import.component').then(
        m => m.ImportComponent
      ),
    title: 'Import — SignalHub',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
