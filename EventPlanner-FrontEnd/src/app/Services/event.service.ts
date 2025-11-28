import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { EventModel } from '../Models/event.model';

export interface EventSearchFilters {
  keyword?: string; // search in title and description
  from?: string; // ISO date
  to?: string; // ISO date
  userId?: string; // user id for role-based filtering
  role?: 'organizer' | 'attendee' | 'any';
}

// Simple in-memory EventService stub. Replace with HTTP calls to a backend later.
@Injectable({ providedIn: 'root' })
export class EventService {
  private events: EventModel[] = [];
  // Expose a snapshot as observable for simple reactivity in components
  private events$ = new BehaviorSubject<EventModel[]>(this.events);

  constructor() {
    // seed with a sample event for demonstration
    this.create({
      title: 'Sample Event',
      date: new Date().toISOString().slice(0, 10),
      time: '18:00',
      location: 'Main Hall',
      description: 'This is a seeded event.',
      organizerId: 'user-1',
      attendees: [{ id: 'user-2', status: 'Maybe' }]
    });
    // additional static events to demonstrate attendee view
    this.create({
      title: 'Community Meetup',
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      time: '19:30',
      location: 'Room A',
      description: 'A meetup for local organizers and attendees.',
      organizerId: 'user-2',
      attendees: [{ id: 'user-1', status: 'Going' }, { id: 'user-3', status: 'Maybe' }]
    });

    this.create({
      title: 'Design Workshop',
      date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      time: '14:00',
      location: 'Workshop Room',
      description: 'Hands-on design exercises.',
      organizerId: 'user-3',
      attendees: [{ id: 'user-1', status: 'Not Going' }]
    });
  }

  private genId() {
    return 'evt-' + Math.random().toString(36).slice(2, 9);
  }

  // Create a new event; returns observable of created event
  create(data: Omit<EventModel, 'id'>): Observable<EventModel> {
    const event: EventModel = { ...data, id: this.genId() } as EventModel;
    this.events = [event, ...this.events];
    this.events$.next(this.events);
    return of(event);
  }

  // Get all events organized by a specific user
  getOrganizedEvents(userId: string): Observable<EventModel[]> {
    const list = this.events.filter(e => e.organizerId === userId);
    return of(list);
  }

  // Get all events where user is an attendee
  getInvitedEvents(userId: string): Observable<EventModel[]> {
    const list = this.events.filter(e => e.attendees?.some(a => a.id === userId));
    return of(list);
  }

  // Invite a user to an event (adds to attendees array)
  invite(eventId: string, userId: string): Observable<boolean> {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx === -1) return of(false);
    const event = this.events[idx];
    if (!event.attendees?.some(a => a.id === userId)) {
      event.attendees.push({ id: userId, status: 'Maybe' });
      this.events[idx] = { ...event };
      this.events$.next(this.events);
    }
    return of(true);
  }

  // Set attendance status for a user for the given event. Returns true on success.
  setAttendanceStatus(eventId: string, userId: string, status: 'Going' | 'Maybe' | 'Not Going'): Observable<boolean> {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx === -1) return of(false);
    const event = this.events[idx];
    const attIdx = event.attendees.findIndex(a => a.id === userId);
    if (attIdx === -1) {
      // if user wasn't an attendee, add them with this status
      event.attendees.push({ id: userId, status });
    } else {
      event.attendees[attIdx] = { ...event.attendees[attIdx], status };
    }
    this.events[idx] = { ...event };
    this.events$.next(this.events);
    return of(true);
  }

  // Delete an event if the caller is the organizer
  delete(eventId: string, callerId: string): Observable<boolean> {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx === -1) return of(false);
    const event = this.events[idx];
    if (event.organizerId !== callerId) return of(false);
    this.events.splice(idx, 1);
    this.events$.next(this.events);
    return of(true);
  }

  // Expose full list observable (optional)
  allEvents$(): Observable<EventModel[]> {
    return this.events$.asObservable();
  }

  // Advanced search API for events
  searchEvents(filters: EventSearchFilters = {}): Observable<EventModel[]> {
    let list = this.events.slice();
    const { keyword, from, to, userId, role } = filters;
    if (keyword) {
      const k = keyword.toLowerCase();
      list = list.filter(e => (e.title || '').toLowerCase().includes(k) || (e.description || '').toLowerCase().includes(k));
    }
    if (from) list = list.filter(e => (e.date || '') >= from);
    if (to) list = list.filter(e => (e.date || '') <= to);
    if (userId) {
      if (role === 'organizer') list = list.filter(e => e.organizerId === userId);
      else if (role === 'attendee') list = list.filter(e => e.attendees.some(a => a.id === userId));
      // if role is 'any' or undefined, include events where user is organizer or attendee
      else list = list.filter(e => e.organizerId === userId || e.attendees.some(a => a.id === userId));
    }
    return of(list);
  }
}
