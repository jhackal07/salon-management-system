import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
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
    this.api
      .post<{ token: string; user: { email: string; name?: string; role: string } }>('/auth/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.auth.login(res.token, res.user);
          this.loading = false;
          this.cdr.detectChanges();
          if (res.user.role === 'admin') {
            this.router.navigate(['/admin/bookings']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          this.error = err.error?.error || 'Login failed.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}
