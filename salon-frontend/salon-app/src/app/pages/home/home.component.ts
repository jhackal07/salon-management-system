import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  services = [
    { title: 'FACIAL', desc: 'Cleansing, exfoliation, and nourishing treatments for glowing skin.', color: '#6b4e9e' },
    { title: 'MAKEUP', desc: 'Professional makeup for events, photoshoots, and everyday looks.', color: '#c75b7a' },
    { title: 'NAIL CARE', desc: 'Manicure, pedicure, and nail art to keep your hands and feet perfect.', color: '#d4af37' },
    { title: 'HAIR CARE', desc: 'Cut, color, styling, and treatments for healthy, beautiful hair.', color: '#2a9d8f' },
    { title: 'MASSAGE', desc: 'Relaxing body and face massage to release tension and rejuvenate.', color: '#e76f51' },
    { title: 'WAXING', desc: 'Smooth, long-lasting hair removal with premium products.', color: '#457b9d' },
  ];

  plans = [
    { name: 'Basic', price: 250, features: ['Nail Trimming', 'Hair Styling', 'Basic Facial'] },
    { name: 'Classic', price: 350, features: ['Basic +', 'Face Massage', 'Hair Treatment'] },
    { name: 'Gold', price: 500, features: ['Classic +', 'Full Body Massage', 'Makeup Session'] },
    { name: 'Platinum', price: 800, features: ['Gold +', 'VIP Lounge', 'All-Day Spa Access'] },
  ];

  stats = [
    { value: '324', label: 'Customers', icon: '👥' },
    { value: '543', label: 'Happy Clients', icon: '🏆' },
    { value: '434', label: 'Awards', icon: '⭐' },
    { value: '234', label: 'New Arrivals', icon: '✨' },
  ];

  testimonials = [
    { text: 'Amazing experience! The team is professional and the results are always beyond my expectations.', name: 'Melisa Smith', role: 'Client' },
    { text: 'I love this salon. Best makeup and styling for my shoots. Highly recommend!', name: 'Josy Brown', role: 'Model' },
  ];
}
