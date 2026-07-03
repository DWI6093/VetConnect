import { Routes } from '@angular/router';
import { InicioSesionComponente } from './features/auth/inicio-sesion/inicio-sesion.component';
import { RegistroComponente } from './features/auth/registro/registro.component';
import { LayoutClientesComponente } from './layouts/clientes/clientes.component';
import { LayoutColaboradoresComponente } from './layouts/colaboradores/colaboradores.component';
import { ClienteInicioComponente } from './features/cliente-inicio/cliente-inicio.component';
import { ColaboradorInicioComponente } from './features/colaborador-inicio/colaborador-inicio.component';
import { CuentaComponente } from '../shared/components/cuenta/cuenta';
import { guardiaAutenticacion } from './core/guards/autenticacion.guard';
import { guardiaRol } from './core/guards/rol.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: InicioSesionComponente,
  },
  {
    path: 'auth/registro',
    component: RegistroComponente,
  },
  {
    path: 'cliente',
    component: LayoutClientesComponente,
    canActivate: [guardiaAutenticacion, guardiaRol],
    data: { rol: 'CLIENTE' },
    children: [
      {
        path: 'inicio',
        component: ClienteInicioComponente,
      },
      {
        path: 'configuracion',
        component: CuentaComponente,
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
    component: LayoutColaboradoresComponente,
    canActivate: [guardiaAutenticacion, guardiaRol],
    data: { rol: 'COLABORADOR' },
    children: [
      {
        path: 'inicio',
        component: ColaboradorInicioComponente,
      },
      {
        path: 'configuracion',
        component: CuentaComponente,
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
