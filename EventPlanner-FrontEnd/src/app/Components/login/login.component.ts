import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email: string = this.loginForm.value.email || '';
      const local = email.split('@')[0] || 'guest';
      // If user already uses a 'user-...' id, keep it; otherwise prefix with 'user-'
      const userId = /^user-[a-z0-9_-]+$/i.test(local) ? local : ('user-' + local.replace(/[^a-z0-9]/gi, ''));
      this.auth.loginAs(userId);
      // navigate to organized events after login
      this.router.navigate(['/events/mine']);
    }
  }
}