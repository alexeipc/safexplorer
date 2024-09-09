export function sanitizeEmail(email: string): string {
    // Replace '.' with ',' (or another allowed character)
    return email.replace(/\./g, ',');
}