export interface RescheduleValidationResult {
    valid: boolean;
    errors: string[] | null;
    warnings: string[] | null;
    dateTime?: Date;
    formattedDate?: {
        full: string;
        date: string;
        time: string;
        iso: string | null;
    };
}

export interface SlotAvailabilityResult {
    available: boolean;
    reason: string | null;
}

export interface ClientRescheduleCheck {
    canReschedule: boolean;
    hoursUntilBooking: number;
    reason: string | null;
    deadlineDate: Date;
    isPastDeadline: boolean;
}

export interface MinRescheduleDateTime {
    date: string;
    time: string;
    minDateTime: Date;
}

export interface RescheduleDeadline {
    deadline: Date;
    formatted: string;
    hoursLeft: number;
    isPastDeadline: boolean;
}