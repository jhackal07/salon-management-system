import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  model = { name: '', email: '', message: '' };

  submit() {
    console.log('Contact form', this.model);
    alert('Thank you! We will get back to you soon.');
    this.model = { name: '', email: '', message: '' };
  }
}
