/**
 * Admin access control.
 *
 * The allowlist is read from the ADMIN_EMAILS env var — a comma-separated
 * list of email addresses (case-insensitive). If the variable is unset or
 * empty, NO ONE can access admin pages (fail-closed).
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}
