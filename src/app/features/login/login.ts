import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    // If already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const credentials: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // Call authentication service
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response.user);
        this.loading = false;
        // Navigate to return URL or home
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        // Handle different error types
        if (error.status === 401) {
          this.error = 'Invalid email or password';
        } else if (error.status === 0) {
          this.error = 'Unable to connect to server. Please check your connection.';
        } else {
          this.error = error.error?.message || 'Login failed. Please try again.';
        }
        console.error('Login error:', error);
      }
    });
  }

  resetForm() {
    this.submitted = false;
    this.error = null;
    this.loginForm.reset();
  }
}
