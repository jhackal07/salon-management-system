
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
 selector:'app-booking',
 templateUrl:'./booking.component.html'
})
export class BookingComponent{

 booking:any = {};

 constructor(private api:ApiService){}

 book(){

  this.api.post("/bookings",this.booking)
  .subscribe(()=>{
    alert("Appointment booked!");
  });

 }

}
