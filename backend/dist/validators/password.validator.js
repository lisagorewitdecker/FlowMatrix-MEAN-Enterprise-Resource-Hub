"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordMatchValidator = exports.passwordStrengthValidator = void 0;
const passwordStrengthValidator = (control) => {
    const value = control.value || '';
    if (!value)
        return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[@$!%*?&#^]/.test(value);
    const isLongEnough = value.length >= 8;
    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && isLongEnough;
    return valid
        ? null
        : {
            passwordStrength: {
                hasUpperCase,
                hasLowerCase,
                hasNumeric,
                hasSpecial,
                isLongEnough
            }
        };
};
exports.passwordStrengthValidator = passwordStrengthValidator;
const passwordMatchValidator = (control) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword)
        return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
};
exports.passwordMatchValidator = passwordMatchValidator;
