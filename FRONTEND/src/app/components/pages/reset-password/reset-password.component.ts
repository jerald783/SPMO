import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../../../../services/notification-services/email.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

  token: string = '';

  newPassword: string = '';
  confirmPassword: string = '';

  message: string = '';

  isSubmitting: boolean = false;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];

      if (!this.token) {
        this.message = "Invalid reset link.";
      }
    });
  }

get passwordMismatch(): boolean {
  return !!this.newPassword && !!this.confirmPassword && this.newPassword !== this.confirmPassword;
}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {

    if (this.passwordMismatch) {
      this.message = "Passwords do not match.";
      return;
    }

    if (!this.token) {
      this.message = "Invalid token.";
      return;
    }

    this.isSubmitting = true;
    this.message = "";

    const data = {
      token: this.token,
      newPassword: this.newPassword
    };

    this.emailService.resetPassword(data).subscribe({
      next: (res: any) => {

        this.message = "Password reset successfully.";

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

        this.isSubmitting = false;
      },
      error: (err) => {

        this.message = err?.error?.message || "Reset failed.";

        this.isSubmitting = false;
      }
    });
  }
}