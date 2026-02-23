import { TestBed } from '@angular/core/testing';
import { Login } from './login';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

describe('Login', () => {
  beforeEach(async () => {
    const activatedRouteStub = { snapshot: { queryParams: {} } } as Partial<ActivatedRoute>;
    const routerStub: Partial<Router> = { navigate: () => Promise.resolve(true) };
    const authServiceStub: Partial<AuthService> = {
      isAuthenticated: () => false,
      login: () => of({ token: '', refreshToken: '', user: { id: '1', email: 'test@example.com', name: 'Test' } })
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: AuthService, useValue: authServiceStub }
      ]
    }).compileComponents();
  });

  it('should create the login component', () => {
    const fixture = TestBed.createComponent(Login);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});
