// Dates are already returned as YYYY-MM-DD from the API.
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

export interface Booking {
  id: number;
  bookingNumber: string;
  date: string;
  time: string;
  serviceName: string;
  artistName: string;
  guestName?: string | null;
  guestEmail?: string | null;
  status: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css',
})
export class MyBookingsComponent {
  bookings: Booking[] = [];
  upcoming: Booking[] = [];
  past: Booking[] = [];
  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  /** YYYY-MM-DD in local timezone (not UTC) */
  private getLocalYyyyMmDd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn) {
      this.error = 'Please sign in to view your bookings.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    this.api.getWithAuth<Booking[]>('/bookings/mine').subscribe({
      next: (data) => {
        this.bookings = data || [];
        const today = this.getLocalYyyyMmDd(new Date());
        this.upcoming = this.bookings.filter((b) => b.date >= today);
        this.past = this.bookings.filter((b) => b.date < today);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not load your bookings.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
