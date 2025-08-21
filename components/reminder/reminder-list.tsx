"use client";

import { Reminder } from "@/lib/db";
import {
    useCreateReminder,
    useDeleteReminder,
    useReminders,
    useReorderReminders,
    useUpdateReminder,
} from "@/lib/hooks/use-reminders";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { ReminderForm } from "./reminder-form";
import { ReminderItem } from "./reminder-item";

export function ReminderList() {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // React Query hooks
  const { data: reminders = [], isLoading } = useReminders();
  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();
  const reorderRemindersMutation = useReorderReminders();

  const handleCreateReminder = async (reminderData: {
    title: string;
    due_date: string;
  }) => {
    createReminderMutation.mutate(reminderData);
  };

  const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
    updateReminderMutation.mutate({ id, updates });
  };

  const handleDeleteReminder = async (id: string) => {
    // Prevent multiple delete attempts
    if (deletingIds.has(id)) return;

    // Mark as deleting
    setDeletingIds((prev) => new Set(prev).add(id));

    deleteReminderMutation.mutate(id, {
      onSettled: () => {
        // Remove from deleting set regardless of success or failure
        setDeletingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      },
    });
  };

  const handleMoveUp = async (reminderId: string) => {
    const currentIndex = reminders.findIndex((reminder) => reminder.id === reminderId);
    if (currentIndex <= 0) return; // Already at top or not found

    const currentReminder = reminders[currentIndex];
    const previousReminder = reminders[currentIndex - 1];

    // Swap the order values between the two reminders
    const reminderOrders = [
      { id: currentReminder.id, order: previousReminder.order },
      { id: previousReminder.id, order: currentReminder.order },
    ];

    reorderRemindersMutation.mutate(reminderOrders);
  };

  const handleMoveDown = async (reminderId: string) => {
    const currentIndex = reminders.findIndex((reminder) => reminder.id === reminderId);
    if (currentIndex >= reminders.length - 1 || currentIndex === -1) return; // Already at bottom or not found

    const currentReminder = reminders[currentIndex];
    const nextReminder = reminders[currentIndex + 1];

    // Swap the order values between the two reminders
    const reminderOrders = [
      { id: currentReminder.id, order: nextReminder.order },
      { id: nextReminder.id, order: currentReminder.order },
    ];

    reorderRemindersMutation.mutate(reminderOrders);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[400px]">
        <div className="flex flex-col justify-center items-center gap-3 p-8">
          <RefreshCw className="size-6 animate-spin" />
          <p>Loading reminders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto p-5 w-full">
      {/* Create Reminder Form */}
      <ReminderForm
        onSubmit={handleCreateReminder}
        loading={createReminderMutation.isPending}
      />

      {/* Reminder List */}
      <div className="space-y-4 max-h-[800px] overflow-y-auto">
        {reminders.length === 0 ? (
          <div>
            <div className="p-8 text-center">
              <div className="space-y-2">
                <h3 className="font-medium text-lg">No reminders found</h3>
                <p className="text-muted-foreground">
                  Create your first reminder to get started!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder, index) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                onUpdate={handleUpdateReminder}
                onDelete={handleDeleteReminder}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                loading={updateReminderMutation.isPending}
                deleting={deletingIds.has(reminder.id)}
                canMoveUp={index > 0}
                canMoveDown={index < reminders.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
