
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";

  interface JwtPayload {
  exp: number;
  role?: string;
}
@Injectable({
  providedIn: 'root',
})

export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  // isTokenValid(): boolean {
  //   const token = localStorage.getItem('authToken');
  //   if (!token) return false;

  //   // Optional: Decode token and check expiry
  //   const payload = JSON.parse(atob(token.split('.')[1]));
  //   const expiration = payload.exp;
  //   const now = Math.floor(Date.now() / 1000);

  //   return expiration > now;
  // }

  isTokenValid(): boolean {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const payload: JwtPayload = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.isTokenValid()) {
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}
// import { Injectable } from '@angular/core';
// import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate, CanActivateChild {
//   constructor(private router: Router) {}

//   isTokenValid(): boolean {
//     const token = localStorage.getItem('authToken');
//     if (!token) return false;

//     // Optional: Decode token and check expiry
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     const expiration = payload.exp;
//     const now = Math.floor(Date.now() / 1000);

//     return expiration > now;
//   }

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//     if (this.isTokenValid()) {
//       return true;
//     } else {
//       this.router.navigate(['/admin-login'], { queryParams: { returnUrl: state.url } });
//       return false;
//     }
//   }

//   canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//     return this.canActivate(route, state);
//   }
// }