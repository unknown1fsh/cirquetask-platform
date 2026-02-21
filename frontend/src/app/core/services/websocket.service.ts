import { Injectable, OnDestroy, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from './notification.service';
import { Subject } from 'rxjs';

export interface BoardEvent {
  type: 'TASK_MOVED' | 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED';
  data: any;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private boardSubscriptions = new Map<number, any>();

  connected = signal(false);
  boardEvents$ = new Subject<BoardEvent>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected.set(true);
        this.subscribeToNotifications();
      },
      onDisconnect: () => {
        this.connected.set(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.boardSubscriptions.forEach(sub => sub.unsubscribe());
    this.boardSubscriptions.clear();
    this.client?.deactivate();
    this.connected.set(false);
  }

  subscribeToBoard(boardId: number): void {
    if (!this.client?.active) return;

    if (this.boardSubscriptions.has(boardId)) return;

    const sub = this.client.subscribe(`/topic/board/${boardId}`, (message: IMessage) => {
      const event: BoardEvent = JSON.parse(message.body);
      this.boardEvents$.next(event);
    });

    this.boardSubscriptions.set(boardId, sub);
  }

  unsubscribeFromBoard(boardId: number): void {
    const sub = this.boardSubscriptions.get(boardId);
    if (sub) {
      sub.unsubscribe();
      this.boardSubscriptions.delete(boardId);
    }
  }

  sendTaskMoved(boardId: number, payload: any): void {
    this.client?.publish({
      destination: `/app/board/${boardId}/task-moved`,
      body: JSON.stringify(payload)
    });
  }

  sendTaskCreated(boardId: number, payload: any): void {
    this.client?.publish({
      destination: `/app/board/${boardId}/task-created`,
      body: JSON.stringify(payload)
    });
  }

  private subscribeToNotifications(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId || !this.client?.active) return;

    this.client.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
      this.notificationService.unreadCount.update(c => c + 1);
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
