import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

type TeamMember = { id: number; name: string; role: string; gender?: string | null };

@Component({
  selector: 'app-team',
  standalone: true,
  templateUrl: './team.component.html',
  styleUrl: './team.component.css',
})
export class TeamComponent {
  members: TeamMember[] = [];
  loading = true;
  /** Tracks which avatar images have finished loading (id -> true) */
  avatarLoaded: Record<number, boolean> = {};
  /** Placeholder cards shown while loading (white avatars, no "Loading…" text) */
  skeletonMembers: TeamMember[] = [
    { id: -1, name: '—', role: '' },
    { id: -2, name: '—', role: '' },
    { id: -3, name: '—', role: '' },
    { id: -4, name: '—', role: '' },
  ];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  getAvatar(member: { gender?: string | null }): string {
    return member.gender === 'female' ? 'assets/default_woman.png' : 'assets/default_man.png';
  }

  onAvatarLoad(member: { id: number }): void {
    this.avatarLoaded[member.id] = true;
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.api.get<{ id: number; name: string; gender?: string | null }[]>('/artists?for=team').subscribe({
      next: (data) => {
        this.members = data.map((a) => ({ id: a.id, name: a.name, role: 'Salon Artist', gender: a.gender ?? null }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
