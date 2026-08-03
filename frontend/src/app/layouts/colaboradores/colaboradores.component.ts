import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../../shared/components/header/header';

@Component({
  selector: 'app-layout-colaboradores',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './colaboradores.component.html',
  styleUrl: './colaboradores.component.css',
})
export class LayoutColaboradoresComponente {}
