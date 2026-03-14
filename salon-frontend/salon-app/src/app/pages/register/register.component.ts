import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;
  success = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  submit() {
    this.error = '';
    if (!this.email?.trim()) {
      this.error = 'Email is required.';
      return;
    }
    if (!this.password) {
      this.error = 'Password is required.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.cdr.detectChanges();
    this.api
      .post<{ message: string }>('/auth/register', {
        name: this.name.trim() || null,
        email: this.email.trim().toLowerCase(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.error || 'Registration failed.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}
