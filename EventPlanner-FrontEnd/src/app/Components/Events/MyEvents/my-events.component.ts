import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../Services/event.service';
import { AuthService } from '../../../Services/auth.service';
import { EventModel } from '../../../Models/event.model';
import { EventItemComponent } from '../EventItem/event-item.component';
import { Subscription } from 'rxjs';
import { UsersService } from '../../../Services/users.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, EventItemComponent],
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css']
})
export class MyEventsComponent implements OnInit, OnDestroy {
  events: EventModel[] = [];
  currentUserId: string | null = null;
  private sub: Subscription | null = null;

  constructor(private svc: EventService, private auth: AuthService, public users: UsersService) {}

  ngOnInit(): void {
    // subscribe to auth changes and reload when user changes
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
    this.svc.getOrganizedEvents(this.currentUserId).subscribe(list => (this.events = list));
  }

  deleteEvent(evt: EventModel) {
    if (!this.currentUserId) return alert('Not logged in');
    if (!confirm('Delete event "' + evt.title + '"?')) return;
    this.svc.delete(evt.id, this.currentUserId).subscribe(ok => {
      if (ok) this.load();
      else alert('Unable to delete (not organizer)');
    });
  }

  invitePrompt(evt: EventModel) {
    const userId = prompt('User ID to invite (example: user-2)');
    if (!userId) return;
    this.svc.invite(evt.id, userId).subscribe(ok => {
      if (ok) alert('Invited ' + userId);
      else alert('Invite failed');
    });
  }
}
