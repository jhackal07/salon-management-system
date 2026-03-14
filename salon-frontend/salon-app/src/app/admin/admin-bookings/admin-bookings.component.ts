import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface Booking {
  id: number;
  bookingNumber: string;
  date: string;
  time: string;
  serviceName: string;
  artistName: string;
  guestName: string | null;
  guestEmail: string | null;
  status: string;
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.css',
})
export class AdminBookingsComponent {
  bookings: Booking[] = [];
  loading = true;
  error = '';
  statusOptions = STATUS_OPTIONS;
  updatingId: number | null = null;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.api.get<Booking[]>('/bookings').subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load bookings.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setStatus(b: Booking, status: string) {
    if (b.status === status) return;
    this.updatingId = b.id;
    this.cdr.detectChanges();
    this.api.patch(`/bookings/${b.id}`, { status }).subscribe({
      next: () => {
        b.status = status;
        this.updatingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to update status.';
        this.updatingId = null;
        this.cdr.detectChanges();
      },
    });
  }

  markPaid(b: Booking) {
    this.setStatus(b, 'paid');
  }
}
