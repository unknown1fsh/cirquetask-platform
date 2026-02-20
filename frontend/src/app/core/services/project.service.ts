import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Member, Project, ProjectRequest, ProjectRole } from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(this.apiUrl);
  }

  getProject(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`);
  }

  createProject(request: ProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.apiUrl, request);
  }

  updateProject(id: number, request: ProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/${id}`, request);
  }

  deleteProject(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getMembers(projectId: number): Observable<ApiResponse<Member[]>> {
    return this.http.get<ApiResponse<Member[]>>(`${this.apiUrl}/${projectId}/members`);
  }

  addMember(projectId: number, userId: number, role: ProjectRole = 'MEMBER'): Observable<ApiResponse<Member>> {
    return this.http.post<ApiResponse<Member>>(`${this.apiUrl}/${projectId}/members`, { userId, role });
  }

  removeMember(projectId: number, memberId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${projectId}/members/${memberId}`);
  }
}
