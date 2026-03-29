// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   intercept(req: HttpRequest<any>, next: HttpHandler) {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       const cloned = req.clone({
//         headers: req.headers.set('Authorization', 'Bearer ' + token)
//       });
//       return next.handle(cloned);
//     }
//     return next.handle(req);
//   }
// }
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');

    const cloned = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('authToken');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
