import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getNotifications(page = 0, size = 20): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/unread-count`).pipe(
      tap(res => {
        if (res.success) {
          this.unreadCount.set(res.data.count);
        }
      })
    );
  }

  markAsRead(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.unreadCount.update(c => Math.max(0, c - 1)))
    );
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }
}
