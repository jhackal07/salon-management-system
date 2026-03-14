import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-services.component.html',
  styleUrl: './admin-services.component.css',
})
export class AdminServicesComponent {
  services: Service[] = [];
  loading = true;
  error = '';
  editing: Service | null = null;
  newService = { name: '', duration: 60, price: 0 };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.get<Service[]>('/services').subscribe({
      next: (data) => {
        this.services = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load services.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  add() {
    if (!this.newService.name.trim()) return;
    this.api.post<Service>('/services', this.newService).subscribe({
      next: () => {
        this.newService = { name: '', duration: 60, price: 0 };
        this.load();
      },
      error: () => {
        this.error = 'Failed to add service';
        this.cdr.detectChanges();
      },
    });
  }

  startEdit(s: Service) {
    this.editing = { ...s };
  }

  saveEdit() {
    if (!this.editing) return;
    this.api.put<Service>(`/services/${this.editing.id}`, this.editing).subscribe({
      next: () => {
        this.editing = null;
        this.load();
      },
      error: () => {
        this.error = 'Failed to update service';
        this.cdr.detectChanges();
      },
    });
  }

  cancelEdit() {
    this.editing = null;
  }

  delete(id: number) {
    if (!confirm('Delete this service?')) return;
    this.api.delete(`/services/${id}`).subscribe({
      next: () => this.load(),
      error: () => {
        this.error = 'Failed to delete service';
        this.cdr.detectChanges();
      },
    });
  }
}
