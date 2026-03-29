import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from '../../../../services/notification-services/email.service';
import { UserService } from '../../../../services/UserServices/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pages-register',
  standalone: false,
  templateUrl: './pages-register.component.html',
  styleUrl: './pages-register.component.scss'
})
export class PagesRegisterComponent implements OnInit {

  @Input() events: any;

  UserId: number | undefined;

  FullName: string = '';
  Email: string = '';
  password: string = '';
  RoleId: number = 3;

  otp: string = '';
  showOtp: boolean = false;

  emailPattern: string = '^[a-zA-Z0-9._%+-]+@up\\.edu\\.ph$';

  roles: { id: number; name: string }[] = [];

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private emailverificationService: EmailService
  ) {}

  ngOnInit(): void {
    this.userService.getRoleId().subscribe((roles) => {
      const allowedRoles = [3, 4];
      this.roles = roles.filter((role: any) =>
        allowedRoles.includes(role.id)
      );
    });
  }

onSubmit() {

  if (!this.Email) {
    this.toastr.error("Email is required");
    return;
  }

  if (!this.showOtp) {

    const payload = {
      email: this.Email
    };
this.emailverificationService.sendVerification(payload).subscribe({
  next: () => {
    this.toastr.info("Verification code sent to your email");
    this.showOtp = true;
  },
  error: (err) => {
    this.toastr.error(err.error.message);
  }
});

  } 
  else {

    if (!this.otp) {
      this.toastr.error("Enter verification code");
      return;
    }

    const user = {
      FullName: this.FullName,
      Email: this.Email,
      Password: this.password,
      Otp: this.otp,
      RoleId: this.RoleId
    };

    this.emailverificationService.verifyAndRegister(user).subscribe(() => {

      this.toastr.success("User registered successfully!");
      this.router.navigate(['/login']);
      this.clearForm();

    });

  }
}

  clearForm(): void {
    this.UserId = undefined;
    this.FullName = '';
    this.Email = '';
    this.password = '';
    this.otp = '';
    this.RoleId = 3;
    this.showOtp = false;
  }
}