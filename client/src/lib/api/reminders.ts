import { apiFetch } from './fetcher';

// Types
export interface ReminderRelease {
  id: number;
  showId: number | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  releaseDate: string;
  releaseType: string;
  title?: string | null;
  description?: string | null;
  isConfirmed: boolean;
}

export interface Reminder {
  id: number;
  releaseId: number;
  reminderType: string;
  triggerDate: string;
  isTriggered: boolean;
  createdAt?: string;
  updatedAt?: string;
  release?: ReminderRelease;
}

export interface CreateReminderInput {
  releaseId?: number;
  reminderType: string; // email | push | in_app, etc.
  triggerDate?: string; // optional override
  // Inline release creation
  release?: {
    showId: number;
    releaseDate: string;
    releaseType: string;
    seasonNumber?: number;
    episodeNumber?: number;
    title?: string;
    description?: string;
    isConfirmed?: boolean;
  };
}

export async function fetchReminders(): Promise<Reminder[]> {
  const data = await apiFetch<{ reminders: Reminder[] }>('/api/reminders');
  return data.reminders || [];
}

export async function fetchUpcomingReminderWindow(days = 30): Promise<Reminder[]> {
  const data = await apiFetch<{ windowDays: number; reminders: Reminder[] }>(`/api/reminders/upcoming?days=${days}`);
  return data.reminders || [];
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const data = await apiFetch<{ reminder: Reminder }>('/api/reminders', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return data.reminder;
}

export async function deleteReminder(id: number): Promise<void> {
  await apiFetch(`/api/reminders/${id}`, { method: 'DELETE' });
}
