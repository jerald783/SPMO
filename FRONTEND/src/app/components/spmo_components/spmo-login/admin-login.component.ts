import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/UserServices/user.service';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  username: string = '';
    password: string = '';
    loginMessage: string = '';
    showPassword: boolean = false;
  
    constructor(private userService: UserService, private router: Router, private ngZone: NgZone) { }
  
  
    onLogin(): void {
      console.log("Logging in with:", this.username, this.password);
      this.userService.login(this.username, this.password).subscribe(
        (response) => {
          console.log("Login successful:", response);
          this.loginMessage = 'Login successful!';
  
          // Store the username in localStorage
          localStorage.setItem('username', this.username);
          this.userService.setAuthData(response.token, response.role);
  
          const role = response.role;
          if (role === 'Admin') {
            this.router.navigate(['/admin', { outlets: { secondary: ['dashboard'] } }]);
          } else {
              this.router.navigate(['/spmo']);
            this.loginMessage = 'Role not assigned or invalid role.';
          }
        },
        (error) => {
          console.error("Login error:", error);
          this.loginMessage = 'Invalid username or password.';
        }
      );
    }
    togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
    }
  
  
  }
  