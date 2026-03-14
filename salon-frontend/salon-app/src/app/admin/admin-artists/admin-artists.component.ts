import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Artist {
  id: number;
  name: string;
  status: string;
  gender?: string | null;
  on_leave_from: string | null;
  on_leave_to: string | null;
}

@Component({
  selector: 'app-admin-artists',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-artists.component.html',
  styleUrl: './admin-artists.component.css',
})
export class AdminArtistsComponent {
  artists: Artist[] = [];
  loading = true;
  error = '';
  editing: Artist | null = null;
  newArtist = { name: '', status: 'active' as string, gender: null as string | null };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.get<Artist[]>('/artists').subscribe({
      next: (data) => {
        this.artists = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load artists.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  add() {
    if (!this.newArtist.name.trim()) return;
    this.api.post<Artist>('/artists', this.newArtist).subscribe({
      next: () => {
        this.newArtist = { name: '', status: 'active', gender: null };
        this.load();
      },
      error: () => {
        this.error = 'Failed to add artist';
        this.cdr.detectChanges();
      },
    });
  }

  startEdit(a: Artist) {
    this.editing = {
      id: a.id,
      name: a.name,
      status: a.status,
      gender: a.gender ?? null,
      on_leave_from: a.on_leave_from || null,
      on_leave_to: a.on_leave_to || null,
    };
  }

  saveEdit() {
    if (!this.editing) return;
    this.api
      .put<Artist>(`/artists/${this.editing.id}`, {
        name: this.editing.name,
        status: this.editing.status,
        gender: this.editing.gender ?? null,
        on_leave_from: this.editing.on_leave_from || null,
        on_leave_to: this.editing.on_leave_to || null,
      })
      .subscribe({
        next: () => {
          this.editing = null;
          this.load();
        },
        error: () => {
          this.error = 'Failed to update artist';
          this.cdr.detectChanges();
        },
      });
  }

  cancelEdit() {
    this.editing = null;
  }

  setInactive(a: Artist) {
    if (!confirm(`Set "${a.name}" as inactive? They will be hidden from Team and Booking.`)) return;
    this.api.put<Artist>(`/artists/${a.id}`, { status: 'inactive' }).subscribe({
      next: () => this.load(),
      error: () => {
        this.error = 'Failed to update artist';
        this.cdr.detectChanges();
      },
    });
  }
}
