import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TaskModel } from '../Models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: TaskModel[] = [];
  private tasks$ = new BehaviorSubject<TaskModel[]>(this.tasks);

  constructor() {
    // seed demo tasks
    this.create({ title: 'Prepare slides', description: 'Slides for Sample Event', date: new Date().toISOString().slice(0, 10), createdBy: 'user-1', assigneeId: 'user-2' });
    this.create({ title: 'Send invites', description: 'Email invites to attendees', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), createdBy: 'user-2', assigneeId: 'user-3' });
  }

  private genId() {
    return 'tsk-' + Math.random().toString(36).slice(2, 9);
  }

  create(data: Omit<TaskModel, 'id'>): Observable<TaskModel> {
    const t: TaskModel = { ...data, id: this.genId() } as TaskModel;
    this.tasks = [t, ...this.tasks];
    this.tasks$.next(this.tasks);
    return of(t);
  }

  allTasks$(): Observable<TaskModel[]> {
    return this.tasks$.asObservable();
  }

  // Simple search: keyword in title/description, date range, assignee/creator filter
  searchTasks(filters: { keyword?: string; from?: string; to?: string; userId?: string; role?: 'assignee' | 'creator' | 'any' } = {}): Observable<TaskModel[]> {
    let list = this.tasks.slice();
    const { keyword, from, to, userId, role } = filters;
    if (keyword) {
      const k = keyword.toLowerCase();
      list = list.filter(t => (t.title || '').toLowerCase().includes(k) || (t.description || '').toLowerCase().includes(k));
    }
    if (from) list = list.filter(t => (t.date || '') >= from);
    if (to) list = list.filter(t => (t.date || '') <= to);
    if (userId) {
      if (role === 'assignee') list = list.filter(t => t.assigneeId === userId);
      else if (role === 'creator') list = list.filter(t => t.createdBy === userId);
      else list = list.filter(t => t.assigneeId === userId || t.createdBy === userId);
    }
    return of(list);
  }
}
