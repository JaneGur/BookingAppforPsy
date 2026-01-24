export function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
}

export function validatePhone(phone: string): boolean {
    const clean = normalizePhone(phone);
    return clean.length === 10 || (clean.length === 11 && clean.startsWith("7"));
}