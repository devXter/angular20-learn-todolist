import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from './features/shared/components/header/header';
import { Footer } from './features/shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
