import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unexpected error occurred.';

      if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.status === 0) {
        errorMsg = 'Unable to connect to the server. Please check your network connection.';
      } else if (error.status === 500) {
        errorMsg = 'Internal server error. Please try again later.';
      }

      // Here you can trigger a global toast notification service (e.g., Angular Material Snackbar or Tailwind Toast)
      console.error(`[Global Error Interceptor]:`, errorMsg);

      return throwError(() => new Error(errorMsg));
    })
  );
};
