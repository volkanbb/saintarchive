import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check for Cloudflare challenge (403 Forbidden or 503 Service Unavailable)
      // Often accompanied by Server: cloudflare or specific HTML content
      const isCloudflare = 
        (error.status === 403 || error.status === 503) && 
        (error.headers.get('Server')?.toLowerCase().includes('cloudflare') || 
         error.error?.toString().includes('cf-browser-verification') ||
         error.error?.toString().includes('challenge-platform'));

      if (isCloudflare) {
        console.warn('Cloudflare challenge detected, forcing page reload to resolve...');
        window.location.reload();
      }

      return throwError(() => error);
    })
  );
};
