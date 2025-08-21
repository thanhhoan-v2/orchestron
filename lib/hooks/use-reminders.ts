"use client";

import { CreateReminderInput, Reminder, UpdateReminderInput } from "@/lib/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const REMINDERS_QUERY_KEY = ["reminders"];

// Get all reminders
export function useReminders() {
  return useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: async (): Promise<Reminder[]> => {
      const response = await fetch("/api/reminders");
      if (!response.ok) {
        throw new Error("Failed to fetch reminders");
      }
      return response.json();
    },
  });
}

// Get single reminder by ID
export function useReminder(id: string) {
  return useQuery({
    queryKey: ["reminder", id],
    queryFn: async (): Promise<Reminder> => {
      const response = await fetch(`/api/reminders/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reminder");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create reminder
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReminderInput): Promise<Reminder> => {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create reminder");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });
}

// Update reminder
export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateReminderInput;
    }): Promise<Reminder> => {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update reminder");
      }

      return response.json();
    },
    onSuccess: (updatedReminder) => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      queryClient.invalidateQueries({ 
        queryKey: ["reminder", updatedReminder.id] 
      });
    },
  });
}

// Delete reminder
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete reminder");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });
}

// Reorder reminders
export function useReorderReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderOrders: { id: string; order: number }[]): Promise<void> => {
      const response = await fetch("/api/reminders/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reminderOrders }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder reminders");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });
}
