import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../../shared/components/header/header';

@Component({
  selector: 'app-layout-clientes',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class LayoutClientesComponente {}
