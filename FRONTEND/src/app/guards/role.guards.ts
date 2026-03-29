import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../../services/UserServices/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const userRole = this.userService.getUserRole();

    if (userRole === expectedRole) {
      return true;
    }

    // Optionally redirect to a "not authorized" page
    // this.router.navigate(['/unauthorized']);
    return false;
  }
}

