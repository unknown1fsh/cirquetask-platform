import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Label } from '../models';

export interface LabelRequest {
  name: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class LabelService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listByProject(projectId: number): Observable<ApiResponse<Label[]>> {
    return this.http.get<ApiResponse<Label[]>>(`${this.apiUrl}/projects/${projectId}/labels`);
  }

  create(projectId: number, request: LabelRequest): Observable<ApiResponse<Label>> {
    return this.http.post<ApiResponse<Label>>(`${this.apiUrl}/projects/${projectId}/labels`, request);
  }

  update(labelId: number, request: LabelRequest): Observable<ApiResponse<Label>> {
    return this.http.put<ApiResponse<Label>>(`${this.apiUrl}/labels/${labelId}`, request);
  }

  delete(labelId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/labels/${labelId}`);
  }
}
