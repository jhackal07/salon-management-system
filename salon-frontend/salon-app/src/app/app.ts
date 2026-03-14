import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  hidePublicLayout = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.hidePublicLayout = this.router.url.startsWith('/admin');
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.hidePublicLayout = e.url.startsWith('/admin');
        this.cdr.detectChanges();
      });
  }
}
