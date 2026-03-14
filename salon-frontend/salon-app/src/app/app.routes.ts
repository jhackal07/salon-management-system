import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ServicesComponent } from './pages/services/services.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { TeamComponent } from './pages/team/team.component';
import { ContactComponent } from './pages/contact/contact.component';
import { BookingComponent } from './pages/booking/booking.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminBookingsComponent } from './admin/admin-bookings/admin-bookings.component';
import { AdminArtistsComponent } from './admin/admin-artists/admin-artists.component';
import { AdminServicesComponent } from './admin/admin-services/admin-services.component';
import { AdminReportingComponent } from './admin/admin-reporting/admin-reporting.component';
import { adminGuard } from './admin/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'team', component: TeamComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'book', component: BookingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'admin/login', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'bookings' },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'artists', component: AdminArtistsComponent },
      { path: 'services', component: AdminServicesComponent },
      { path: 'report', component: AdminReportingComponent },
      { path: 'payments', component: AdminReportingComponent },
    ],
  },
];
