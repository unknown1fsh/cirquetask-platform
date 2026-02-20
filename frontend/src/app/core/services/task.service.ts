import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Task, TaskRequest, TaskMoveRequest, Comment, CommentRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createTask(projectId: number, request: TaskRequest): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/projects/${projectId}/tasks`, request);
  }

  getTask(taskId: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}`);
  }

  getProjectTasks(projectId: number, params?: { status?: string; priority?: string; assigneeId?: number }): Observable<ApiResponse<Task[]>> {
    let url = `${this.apiUrl}/projects/${projectId}/tasks`;
    if (params) {
      const q = new URLSearchParams();
      if (params.status) q.set('status', params.status);
      if (params.priority) q.set('priority', params.priority);
      if (params.assigneeId != null) q.set('assigneeId', String(params.assigneeId));
      const query = q.toString();
      if (query) url += '?' + query;
    }
    return this.http.get<ApiResponse<Task[]>>(url);
  }

  getMyTasks(): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/tasks/my`);
  }

  updateTask(taskId: number, request: TaskRequest): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}`, request);
  }

  moveTask(taskId: number, request: TaskMoveRequest): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}/move`, request);
  }

  deleteTask(taskId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/tasks/${taskId}`);
  }

  assignUser(taskId: number, assigneeId: number): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}/assign/${assigneeId}`, {});
  }

  unassignUser(taskId: number, assigneeId: number): Observable<ApiResponse<Task>> {
    return this.http.delete<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}/assign/${assigneeId}`);
  }

  // Comments
  getComments(taskId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.apiUrl}/tasks/${taskId}/comments`);
  }

  addComment(taskId: number, request: CommentRequest): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`${this.apiUrl}/tasks/${taskId}/comments`, request);
  }

  deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/comments/${commentId}`);
  }

  addLabelToTask(taskId: number, labelId: number): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}/labels/${labelId}`, {});
  }

  removeLabelFromTask(taskId: number, labelId: number): Observable<ApiResponse<Task>> {
    return this.http.delete<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}/labels/${labelId}`);
  }
}
