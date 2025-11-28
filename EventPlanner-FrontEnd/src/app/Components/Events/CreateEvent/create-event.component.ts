import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../Services/event.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent {
  isLoading = false;

  form: any;

  currentUserId: string | null = null;

  constructor(private fb: FormBuilder, private svc: EventService, private router: Router, private auth: AuthService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: [''],
      location: [''],
      description: ['']
    });
    // initialize current user from auth service
    this.currentUserId = this.auth.getCurrentUserId();
  }

  submit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    const current = this.auth.getCurrentUserId();
    if (!current) {
      alert('You must be logged in to create an event.');
      this.isLoading = false;
      return;
    }

    const data = {
      ...this.form.value,
      organizerId: current,
      attendees: [] as string[]
    };
    // cast to required shape
    this.svc.create(data as any).subscribe({
      next: (evt) => {
        this.isLoading = false;
        // navigate to user's events
        this.router.navigate(['/events/mine']);
      },
      error: () => (this.isLoading = false)
    });
  }
}
