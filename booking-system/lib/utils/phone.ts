export function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
}

export function formatPhone(phone: string): string {
    const clean = normalizePhone(phone);
    if (clean.length === 11 && clean.startsWith("7")) {
        return `+7 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9)}`;
    }
    return phone;
}

export function validatePhone(phone: string): boolean {
    const clean = normalizePhone(phone);
    return clean.length === 10 || (clean.length === 11 && clean.startsWith("7"));
}