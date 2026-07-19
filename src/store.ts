import { Appointment, BlockedSlot } from './types';

const APPOINTMENTS_KEY = 'derm_appointments';
const BLOCKED_SLOTS_KEY = 'derm_blocked_slots';

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

// Helper functions for localStorage fallback
const getAppointmentsFromLocalStorage = (): Appointment[] => {
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

const getBlockedSlotsFromLocalStorage = (): BlockedSlot[] => {
  const data = localStorage.getItem(BLOCKED_SLOTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const res = await fetch('/api/appointments');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback to localStorage on network or CORS errors in development
  }
  return getAppointmentsFromLocalStorage();
};

export const saveAppointment = async (appointment: Appointment): Promise<void> => {
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    if (res.ok) {
      return;
    }
  } catch (e) {
    // Fallback
  }
  const apps = getAppointmentsFromLocalStorage();
  apps.push(appointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(apps));
};

export const getBlockedSlots = async (): Promise<BlockedSlot[]> => {
  try {
    const res = await fetch('/api/blocked-slots');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }
  return getBlockedSlotsFromLocalStorage();
};

export const saveBlockedSlot = async (slot: BlockedSlot): Promise<void> => {
  try {
    const res = await fetch('/api/blocked-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot),
    });
    if (res.ok) {
      return;
    }
  } catch (e) {
    // Fallback
  }
  const slots = getBlockedSlotsFromLocalStorage();
  if (!slots.some(s => s.date === slot.date && s.time === slot.time)) {
    slots.push(slot);
    localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(slots));
  }
};

export const removeBlockedSlot = async (date: string, time: string | 'ALL'): Promise<void> => {
  try {
    const res = await fetch(`/api/blocked-slots?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return;
    }
  } catch (e) {
    // Fallback
  }
  let slots = getBlockedSlotsFromLocalStorage();
  slots = slots.filter(s => !(s.date === date && s.time === time));
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(slots));
};

