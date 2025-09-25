import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReminder, deleteReminder, CreateReminderInput } from '../lib/api/reminders';
import { toast } from '../lib/ui/toast';

interface UseReminderMutationsOptions {
  onCreated?: () => void;
  onDeleted?: () => void;
}

export function useReminderMutations(opts: UseReminderMutationsOptions = {}) {
  const qc = useQueryClient();

  const create = useMutation({
  mutationFn: (input: CreateReminderInput) => createReminder(input),
    onSuccess: () => {
      toast.success('Reminder saved');
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['reminders','upcoming-window'] });
      opts.onCreated?.();
    },
    onError: (err: any) => {
      toast.error(`Failed to save reminder: ${err?.message || 'Unknown error'}`);
    }
  });

  const remove = useMutation({
  mutationFn: (id: number) => deleteReminder(id),
    onSuccess: () => {
      toast.success('Reminder deleted');
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['reminders','upcoming-window'] });
      opts.onDeleted?.();
    },
    onError: (err: any) => {
      toast.error(`Failed to delete reminder: ${err?.message || 'Unknown error'}`);
    }
  });

  return {
    createReminder: create.mutate,
    createAsync: create.mutateAsync,
    createStatus: create.status,
    deleteReminder: remove.mutate,
    deleteAsync: remove.mutateAsync,
    deleteStatus: remove.status
  };
}
