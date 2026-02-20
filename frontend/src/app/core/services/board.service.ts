import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Board } from '../models';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProjectBoards(projectId: number): Observable<ApiResponse<Board[]>> {
    return this.http.get<ApiResponse<Board[]>>(`${this.apiUrl}/projects/${projectId}/boards`);
  }

  getBoard(boardId: number): Observable<ApiResponse<Board>> {
    return this.http.get<ApiResponse<Board>>(`${this.apiUrl}/boards/${boardId}`);
  }

  createBoard(projectId: number, name: string, description?: string): Observable<ApiResponse<Board>> {
    return this.http.post<ApiResponse<Board>>(`${this.apiUrl}/projects/${projectId}/boards`, { name, description });
  }

  addColumn(boardId: number, name: string, color?: string): Observable<ApiResponse<Board>> {
    return this.http.post<ApiResponse<Board>>(`${this.apiUrl}/boards/${boardId}/columns`, { name, color });
  }

  removeColumn(columnId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/columns/${columnId}`);
  }

  reorderColumns(boardId: number, columnIds: number[]): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/boards/${boardId}/columns/reorder`, columnIds);
  }
}
