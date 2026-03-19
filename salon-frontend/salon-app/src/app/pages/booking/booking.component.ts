import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface Artist {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent {
  artists: Artist[] = [];
  services: Service[] = [];
  timeSlots: string[] = [];
  booking = {
    date: '',
    time: '',
    serviceId: null as number | null,
    artistId: null as number | null,
    asGuest: true,
    guestName: '',
    guestEmail: '',
    loginEmail: '',
    loginPassword: '',
  };
  loading = false;
  error = '';
  confirmed: { bookingNumber: string; date: string; time: string; serviceName: string; artistName: string } | null = null;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.buildTimeSlots();
  }

  /** Returns YYYY-MM-DD using the user's local timezone (not UTC). */
  private getLocalYyyyMmDd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private buildTimeSlots() {
    const openHour = 9;
    const closeHour = 20; // open until 8pm; last start slot is 19:30
    for (let h = openHour; h < closeHour; h++) {
      for (const m of ['00', '30']) {
        this.timeSlots.push(`${String(h).padStart(2, '0')}:${m}`);
      }
    }
  }

  /** Today in YYYY-MM-DD (local) for min date attribute */
  get minDate(): string {
    return this.getLocalYyyyMmDd(new Date());
  }

  /** Time slots available for the selected date (excludes past times when date is today) */
  get availableTimeSlots(): string[] {
    const date = this.booking.date;
    if (!date || date > this.minDate) return this.timeSlots;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return this.timeSlots.filter((slot) => {
      const [h, m] = slot.split(':').map(Number);
      const slotMinutes = h * 60 + m;
      return slotMinutes > currentMinutes;
    });
  }

  onDateChange(date: string) {
    this.booking.artistId = null;
    if (date && date === this.minDate && this.booking.time) {
      const now = new Date();
      const [h, m] = this.booking.time.split(':').map(Number);
      const slotMinutes = h * 60 + m;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= currentMinutes) this.booking.time = '';
    }
    this.loadArtistsForDate(date);
  }

  private loadArtistsForDate(date: string) {
    if (!date) {
      this.artists = [];
      this.cdr.detectChanges();
      return;
    }
    this.api.get<Artist[]>(`/artists?for=booking&date=${encodeURIComponent(date)}`).subscribe({
      next: (data) => {
        this.artists = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.artists = [];
        if (!this.error) this.error = 'Could not load artists for this date.';
        this.cdr.detectChanges();
      },
    });
  }

  ngOnInit() {
    if (this.auth.isLoggedIn && this.auth.currentUser && !this.auth.isAdmin) {
      this.booking.asGuest = false;
      this.booking.guestEmail = this.auth.currentUser.email;
      this.booking.guestName = this.auth.currentUser.name ?? '';
    }
    this.loadArtistsForDate(this.booking.date);
    this.api.get<Service[]>('/services').subscribe({
      next: (data) => {
        this.services = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = this.error || 'Could not load services.';
        this.cdr.detectChanges();
      },
    });
  }

  submit() {
    this.error = '';
    if (!this.booking.date || !this.booking.time || !this.booking.serviceId || !this.booking.artistId) {
      this.error = 'Please fill in Date, Time, Service, and Artist.';
      return;
    }
    if (this.booking.date < this.minDate) {
      this.error = 'Please choose today or a future date.';
      return;
    }
    if (this.booking.date === this.minDate && this.availableTimeSlots.indexOf(this.booking.time) === -1) {
      this.error = 'That time has passed. Please choose an upcoming time.';
      return;
    }
    const isLoggedIn = this.auth.isLoggedIn && this.auth.currentUser;
    const isAdmin = this.auth.isAdmin;
    if (isAdmin && (!this.booking.guestName?.trim() || !this.booking.guestEmail?.trim())) {
      this.error = 'Enter the customer\'s name and email.';
      return;
    }
    if (!isLoggedIn && this.booking.asGuest && (!this.booking.guestName || !this.booking.guestEmail)) {
      this.error = 'As guest, please enter your name and email.';
      return;
    }
    this.loading = true;
    const body: Record<string, unknown> = {
      date: this.booking.date,
      time: this.booking.time,
      serviceId: this.booking.serviceId,
      artistId: this.booking.artistId,
    };
    if (isAdmin) {
      body['guestName'] = this.booking.guestName.trim();
      body['guestEmail'] = this.booking.guestEmail.trim();
    } else if (isLoggedIn) {
      body['userId'] = this.auth.currentUser!.id;
      body['guestEmail'] = this.auth.currentUser!.email;
      body['guestName'] = this.auth.currentUser!.name ?? '';
    } else if (this.booking.asGuest) {
      body['guestName'] = this.booking.guestName;
      body['guestEmail'] = this.booking.guestEmail;
    }
    this.api
      .post<{ bookingNumber: string; booking: { date: string; time: string; serviceName: string; artistName: string } }>(
        '/bookings',
        body
      )
      .subscribe({
        next: (res) => {
          this.confirmed = {
            bookingNumber: res.bookingNumber,
            date: res.booking.date,
            time: res.booking.time,
            serviceName: res.booking.serviceName,
            artistName: res.booking.artistName,
          };
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.error || 'Booking failed. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  bookAnother() {
    this.confirmed = null;
    const isLoggedIn = this.auth.isLoggedIn && this.auth.currentUser;
    const isAdmin = this.auth.isAdmin;
    this.booking = {
      date: '',
      time: '',
      serviceId: null,
      artistId: null,
      asGuest: !isLoggedIn,
      guestName: isLoggedIn && !isAdmin ? (this.auth.currentUser!.name ?? '') : '',
      guestEmail: isLoggedIn && !isAdmin ? (this.auth.currentUser!.email ?? '') : '',
      loginEmail: '',
      loginPassword: '',
    };
  }
}
