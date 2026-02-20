import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: router }
      ]
    });
    localStorage.clear();
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getToken should return null when no token in storage', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken should return token from storage', () => {
    localStorage.setItem('accessToken', 'test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('isAuthenticated should be false when no user in storage', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logout should clear storage and navigate to login', () => {
    localStorage.setItem('accessToken', 'x');
    localStorage.setItem('refreshToken', 'y');
    localStorage.setItem('user', '{}');
    service.logout();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
