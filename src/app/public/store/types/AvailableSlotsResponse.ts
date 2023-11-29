export interface AvailableSlotsResponse {
    date: string;
    dayOfWeek: string;
    inStoreLocation: ModeSlotsInfo;
    noLocation: ModeSlotsInfo;
    address: ModeSlotsInfo;
}

export interface ModeSlotsInfo {
    availableSlots: Slot[];
    selectedSlot: Slot;
    slotDurationEnabled: boolean;
}

export interface Slot {
    startTime: string;
    endTime: string;
    totalOrders: number;
    isDisabled: boolean;
}
