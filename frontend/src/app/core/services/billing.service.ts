import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PlanDto } from '../models';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly apiUrl = `${environment.apiUrl}/billing`;

  constructor(private readonly http: HttpClient) {}

  getPlan(): Observable<ApiResponse<PlanDto>> {
    return this.http.get<ApiResponse<PlanDto>>(`${this.apiUrl}/plan`);
  }

  createCheckoutSession(plan: 'PRO' | 'BUSINESS', yearly: boolean): Observable<ApiResponse<{ url: string }>> {
    return this.http.post<ApiResponse<{ url: string }>>(`${this.apiUrl}/checkout-session`, { plan, yearly });
  }

  getPortalSessionUrl(): Observable<ApiResponse<{ url: string }>> {
    return this.http.get<ApiResponse<{ url: string }>>(`${this.apiUrl}/portal-session`);
  }
}
