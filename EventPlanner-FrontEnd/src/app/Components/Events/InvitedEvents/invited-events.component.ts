import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../Services/event.service';
import { EventModel } from '../../../Models/event.model';
import { AuthService } from '../../../Services/auth.service';
import { EventItemComponent } from '../EventItem/event-item.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invited-events',
  standalone: true,
  imports: [CommonModule, EventItemComponent],
  templateUrl: './invited-events.component.html',
  styleUrls: ['./invited-events.component.css']
})
export class InvitedEventsComponent implements OnInit, OnDestroy {
  events: EventModel[] = [];
  currentUserId: string | null = null;
  private sub: Subscription | null = null;

  constructor(private svc: EventService, private auth: AuthService) {}

  ngOnInit(): void {
    this.sub = this.auth.currentUser$.subscribe(uid => {
      this.currentUserId = uid;
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  load() {
    if (!this.currentUserId) {
      this.events = [];
      return;
    }
    this.svc.getInvitedEvents(this.currentUserId).subscribe(list => (this.events = list));
  }

  setStatus(evtId: string, status: 'Going' | 'Maybe' | 'Not Going') {
    if (!this.currentUserId) return alert('Not logged in');
    this.svc.setAttendanceStatus(evtId, this.currentUserId, status).subscribe(ok => {
      if (ok) this.load();
      else alert('Failed to set status');
    });
  }

  attendeeStatus(e: EventModel): string | undefined {
    if (!this.currentUserId) return undefined;
    return e.attendees.find(a => a.id === this.currentUserId)?.status;
  }

  isStatus(e: EventModel, status: 'Going' | 'Maybe' | 'Not Going') {
    return this.attendeeStatus(e) === status;
  }
}
