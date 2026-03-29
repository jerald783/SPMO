import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/UserServices/user.service';
import { SettingsService } from '../../../../services/UserServices/settings.service';
declare const google: any;
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy,OnInit {
  Email: string = '';
  password: string = '';
  loginMessage: string = '';
  showPassword: boolean = false;
  isSubmitting: boolean = false;

  maxAttempts: number = 5;
  lockoutTimeMs: number = 3 * 60 * 1000; // 3 minutes
  failedAttempts: number = 0;
  lockoutUntil: number | null = null;
  countdownInterval: any;

  countdownMinutes: number = 0;
  countdownSeconds: number = 0;

  constructor(
    private userService: UserService,
    private router: Router,
    private ngZone: NgZone,
    private settingsService: SettingsService
  ) {
    const lockout = localStorage.getItem('lockoutUntil');
    if (lockout) {
      this.lockoutUntil = +lockout;
      if (Date.now() < this.lockoutUntil) {
        this.startCountdown();
      } else {
        this.clearLockout();
      }
    }
  }

  get now(): number {
    return Date.now();
  }

  onLogin(): void {
    if (this.isSubmitting) return;

    if (this.lockoutUntil && this.now < this.lockoutUntil) {
      this.startCountdown();
      return;
    }

    this.isSubmitting = true;
    this.loginMessage = '';

    const Email = this.Email.trim();
    const password = this.password.trim();

    if (!Email || !password) {
      this.loginMessage = 'Please enter both username and password.';
      this.isSubmitting = false;
      return;
    }

    this.userService.login(this.Email, this.password).subscribe(
      (response) => {
        console.log("Login successful:", response);
        localStorage.setItem('Email', this.Email);
         localStorage.setItem('fullName', response.fullName);
          localStorage.setItem('role', response.role); 
        this.userService.setAuthData(response.token, response.role);

        this.failedAttempts = 0;
        this.clearLockout();

       if (response.role === 'SPMO') {
           this.router.navigate(['/adminspmo', { outlets: { secondary: ['dashboard'] } }]);
        }else {
          this.loginMessage = 'Role not assigned or invalid role.';
        }

        this.isSubmitting = false;
      },
      (error) => {
        this.failedAttempts++;
        if (this.failedAttempts >= this.maxAttempts) {
          this.lockoutUntil = this.now + this.lockoutTimeMs;
          localStorage.setItem('lockoutUntil', this.lockoutUntil.toString());
          this.startCountdown();
        } else {
          const attemptsLeft = this.maxAttempts - this.failedAttempts;
          this.loginMessage = `Invalid username or password. Attempts left: ${attemptsLeft}`;
        }
        this.isSubmitting = false;
      }
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private startCountdown(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      if (this.lockoutUntil && this.now < this.lockoutUntil) {
        const remainingMs = this.lockoutUntil - this.now;
        this.countdownMinutes = Math.floor(remainingMs / 60000);
        this.countdownSeconds = Math.floor((remainingMs % 60000) / 1000);
      } else {
        this.clearLockout();
      }
    }, 1000);
  }

  private clearLockout(): void {
    this.lockoutUntil = null;
    this.failedAttempts = 0;
    this.loginMessage = '';
    localStorage.removeItem('lockoutUntil');
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }



//   ngOnInit(): void {
//   google.accounts.id.initialize({
//     client_id: "693611222238-rmrnu8v3j3cc5uj4k22sdsqgk6tkenr8.apps.googleusercontent.com",
//     callback: (response: any) => {
//       this.handleGoogleLogin(response);
//     }
//   });

//   google.accounts.id.renderButton(
//     document.getElementById("googleBtn"),
//     {
//       theme: "outline",
//       size: "large",
//       width: 250
//     }
//   );
// }

ngOnInit(): void {

  this.settingsService.getGoogleClientId().subscribe((res:any)=>{
  
    google.accounts.id.initialize({
      client_id: res.clientId,
      callback: (response:any) => {
        this.handleGoogleLogin(response);
      }
    });

    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        width: 250
      }
    );

  });

}
handleGoogleLogin(response: any) {

  const token = response.credential;

  this.settingsService.googleLogin(token).subscribe(
    (res: any) => {

      localStorage.setItem('Email', response.email);
      localStorage.setItem('fullName', res.fullName);
      localStorage.setItem('role', res.role);

      this.userService.setAuthData(res.token, res.role);

        if (res.role === 'SPMO') {
          this.router.navigate(['/adminspmo']).then(() => {
  window.dispatchEvent(new Event('resize'));
});
        }else {
          this.loginMessage = 'Role not assigned or invalid role.';
        }

    },
    () => {
      this.loginMessage = "Google account not registered.";
    }
  );
  
}

goToRegister() {
  this.isSubmitting = true;

  setTimeout(() => {
    this.router.navigate(['/pages-register']);
  }, 800); // 800ms delay
}

goToForgot() {
  this.isSubmitting = true;

  setTimeout(() => {
    this.router.navigate(['/forgot-password']);
  }, 800); // 800ms delay
}

}


