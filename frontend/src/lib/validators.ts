// Shared validation helpers for auth flows.
// Enforced SERVER-SIDE at registration (and mirrored client-side for UX).
// Never enforced at login — existing accounts must always be able to sign in.

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Pragmatic format check (not exhaustive RFC 5322, but blocks junk)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9\s]/,
};

/**
 * Returns a human-readable error message, or null if the password is valid.
 * Rules: >= 8 chars, at least 1 uppercase, 1 number, 1 special character.
 */
export function validatePasswordStrength(password: string): string | null {
  if (!password || password.length < PASSWORD_REQUIREMENTS.minLength) {
    return "Password must be at least 8 characters";
  }
  if (!PASSWORD_REQUIREMENTS.uppercase.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!PASSWORD_REQUIREMENTS.number.test(password)) {
    return "Password must contain at least one number";
  }
  if (!PASSWORD_REQUIREMENTS.special.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
}
