import { FormGroup } from '@angular/forms';

/**
 * Applies server-side validation errors to form controls.
 * Backend returns 400 with body: { success: false, message: "Validation failed", data: { fieldName: "error message" } }
 */
export function applyServerValidationErrors(form: FormGroup, data: Record<string, string> | undefined | null): void {
  if (!form || !data || typeof data !== 'object') return;
  Object.keys(data).forEach(key => {
    const control = form.get(key);
    if (control) {
      control.setErrors({ ...control.errors, serverError: data[key] });
      control.markAsTouched();
    }
  });
}
