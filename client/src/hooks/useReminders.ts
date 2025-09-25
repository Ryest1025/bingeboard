import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReminders, fetchUpcomingReminderWindow, createReminder, deleteReminder, CreateReminderInput, Reminder } from '../lib/api/reminders';

const REMINDERS_KEY = ['reminders'];
const UPCOMING_REMINDERS_KEY = (days: number) => ['reminders','upcoming', days];

export function useReminders() {
  return useQuery({
    queryKey: REMINDERS_KEY,
    queryFn: fetchReminders
  });
}

export function useUpcomingReminders(days = 30) {
  return useQuery({
    queryKey: UPCOMING_REMINDERS_KEY(days),
    queryFn: () => fetchUpcomingReminderWindow(days)
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(input),
    onSuccess: (reminder: Reminder) => {
      qc.invalidateQueries({ queryKey: REMINDERS_KEY });
      qc.invalidateQueries({ queryKey: ['reminders','upcoming'] });
    }
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReminder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REMINDERS_KEY });
      qc.invalidateQueries({ queryKey: ['reminders','upcoming'] });
    }
  });
}
