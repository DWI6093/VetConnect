import { Routes } from '@angular/router';
import { guardiaAutenticacion } from './core/guards/autenticacion.guard';
import { guardiaRol } from './core/guards/rol.guard';
import { guardiaEstadoEliminacionChild } from './core/guards/estadoEliminacion.guard';
import { NegocioFormularioComponente } from './features/negocio-formulario/negocio-formulario.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/inicio-sesion/inicio-sesion.component').then(
        (m) => m.InicioSesionComponente,
      ),
  },
  {
    path: 'auth/registro',
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then(
        (m) => m.RegistroComponente,
      ),
  },
  {
    path: 'cliente',
    loadComponent: () =>
      import('./layouts/clientes/clientes.component').then(
        (m) => m.LayoutClientesComponente,
      ),
    canActivate: [guardiaAutenticacion, guardiaRol],
    canActivateChild: [guardiaEstadoEliminacionChild],
    data: { rol: 'CLIENTE' },
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/cliente-inicio/cliente-inicio.component').then(
            (m) => m.ClienteInicioComponente,
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('../shared/components/cuenta/cuenta').then(
            (m) => m.CuentaComponente,
          ),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'colaborador',
    loadComponent: () =>
      import('./layouts/colaboradores/colaboradores.component').then(
        (m) => m.LayoutColaboradoresComponente,
      ),
    canActivate: [guardiaAutenticacion, guardiaRol],
    canActivateChild: [guardiaEstadoEliminacionChild],
    data: { rol: 'COLABORADOR' },
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/colaborador-inicio/colaborador-inicio.component').then(
            (m) => m.ColaboradorInicioComponente,
          ),
      },
      {
        path: 'negocios/crear',
        loadComponent: () =>
          import('./features/negocio-formulario/negocio-formulario.component').then(
            (m) => m.NegocioFormularioComponente,
          ),
      },
      {
        path: 'negocios/:id/editar',
        loadComponent: () =>
          import('./features/negocio-formulario/negocio-formulario.component').then(
            (m) => m.NegocioFormularioComponente,
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('../shared/components/cuenta/cuenta').then(
            (m) => m.CuentaComponente,
          ),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
