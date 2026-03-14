import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  plans = [
    { name: 'Basic', price: 250, features: ['Nail Trimming', 'Hair Styling', 'Basic Facial'] },
    { name: 'Classic', price: 350, features: ['Basic +', 'Face Massage', 'Hair Treatment'] },
    { name: 'Gold', price: 500, features: ['Classic +', 'Full Body Massage', 'Makeup Session'] },
    { name: 'Platinum', price: 800, features: ['Gold +', 'VIP Lounge', 'All-Day Spa Access'] },
  ];
}
