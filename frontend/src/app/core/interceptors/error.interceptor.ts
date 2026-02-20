import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';

const STATUS_MESSAGES: Record<number, string> = {
  402: 'errors.planLimit',
  403: 'errors.forbidden',
  404: 'errors.notFound',
  429: 'errors.tooManyRequests',
  500: 'errors.serverError'
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const translate = inject(TranslateService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;
      if (status === 402 || status === 403 || status === 404 || status === 429 || status === 500) {
        const message =
          error.error?.message ||
          (STATUS_MESSAGES[status] ? translate.instant(STATUS_MESSAGES[status]) : translate.instant('errors.generic'));
        snackBar.open(message, translate.instant('common.close'), { duration: 6000 });
        if (status === 402) {
          router.navigate(['/pricing']);
        }
      }
      return throwError(() => error);
    })
  );
};
