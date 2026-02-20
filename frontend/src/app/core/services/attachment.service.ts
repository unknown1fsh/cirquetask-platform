import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Attachment } from '../models';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listByTask(taskId: number): Observable<ApiResponse<Attachment[]>> {
    return this.http.get<ApiResponse<Attachment[]>>(`${this.apiUrl}/tasks/${taskId}/attachments`);
  }

  upload(taskId: number, file: File): Observable<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<Attachment>>(`${this.apiUrl}/tasks/${taskId}/attachments`, formData);
  }

  download(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  delete(attachmentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/attachments/${attachmentId}`);
  }
}
