import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  submit() {
    this.error = '';
    this.loading = true;
    this.cdr.detectChanges();
    this.api.post<{ token: string; user: { email: string; role: string } }>('/admin/login', { email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.auth.login(res.token, res.user);
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/admin/bookings']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
