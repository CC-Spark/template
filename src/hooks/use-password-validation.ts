import { useState } from 'react';
import { isPasswordValid } from '@/lib/utils';

/**
 * Custom hook for password validation and matching
 * Handles password and confirm password state, validation, and mismatch detection
 *
 * @returns Object containing password state, handlers, and validation state
 *
 * @example
 * ```tsx
 * const {
 *   password,
 *   confirmPassword,
 *   showPasswordMismatch,
 *   handlePasswordChange,
 *   handleConfirmPasswordChange,
 *   isFormValid
 * } = usePasswordValidation();
 * ```
 */
export function usePasswordValidation() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (confirmPassword && e.target.value !== confirmPassword) {
            setShowPasswordMismatch(true);
        } else {
            setShowPasswordMismatch(false);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (password && e.target.value !== password) {
            setShowPasswordMismatch(true);
        } else {
            setShowPasswordMismatch(false);
        }
    };

    const isFormValid = isPasswordValid(password) && password === confirmPassword && password.length > 0;

    return {
        password,
        confirmPassword,
        showPasswordMismatch,
        handlePasswordChange,
        handleConfirmPasswordChange,
        isFormValid,
    };
}
