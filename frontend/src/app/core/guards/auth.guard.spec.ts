import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow activation when authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    expect(TestBed.runInInjectionContext(() => authGuard(null!, null!))).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => authGuard(null!, null!))).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});

describe('guestGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow activation when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => guestGuard(null!, null!))).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    expect(TestBed.runInInjectionContext(() => guestGuard(null!, null!))).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
