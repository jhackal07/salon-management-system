import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface ReportBooking {
  id: number;
  bookingNumber: string;
  date: string;
  time: string;
  serviceName: string;
  artistName: string;
  guestName: string | null;
  guestEmail: string | null;
  status: string;
  price: number;
  isGuest: boolean;
}

interface Report {
  from: string;
  to: string;
  bookings: ReportBooking[];
  earnings: number;
  guestCount: number;
  accountCount: number;
}

@Component({
  selector: 'app-admin-reporting',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './admin-reporting.component.html',
  styleUrl: './admin-reporting.component.css',
})
export class AdminReportingComponent {
  from = '';
  to = '';
  report: Report | null = null;
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const today = new Date().toISOString().slice(0, 10);
    this.from = today;
    this.to = today;
    this.loadReport();
  }

  loadReport() {
    if (!this.from || !this.to) return;
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    const params = `?from=${encodeURIComponent(this.from)}&to=${encodeURIComponent(this.to)}`;
    this.api.get<Report>(`/report${params}`).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load report.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyRange() {
    this.loadReport();
  }
}
