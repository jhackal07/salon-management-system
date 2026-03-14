import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent {
  services = [
    { title: 'FACIAL', desc: 'Cleansing, exfoliation, and nourishing treatments for glowing skin.', color: '#6b4e9e' },
    { title: 'MAKEUP', desc: 'Professional makeup for events, photoshoots, and everyday looks.', color: '#c75b7a' },
    { title: 'NAIL CARE', desc: 'Manicure, pedicure, and nail art to keep your hands and feet perfect.', color: '#d4af37' },
    { title: 'HAIR CARE', desc: 'Cut, color, styling, and treatments for healthy, beautiful hair.', color: '#2a9d8f' },
    { title: 'MASSAGE', desc: 'Relaxing body and face massage to release tension and rejuvenate.', color: '#e76f51' },
    { title: 'WAXING', desc: 'Smooth, long-lasting hair removal with premium products.', color: '#457b9d' },
  ];
}
