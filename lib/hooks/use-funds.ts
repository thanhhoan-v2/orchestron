"use client";

import { CreateFundInput, Fund, UpdateFundInput } from "@/lib/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const FUNDS_QUERY_KEY = ["funds"];

// Get all funds
export function useFunds() {
  return useQuery({
    queryKey: FUNDS_QUERY_KEY,
    queryFn: async (): Promise<Fund[]> => {
      const response = await fetch("/api/funds");
      if (!response.ok) {
        throw new Error("Failed to fetch funds");
      }
      return response.json();
    },
  });
}

// Get single fund by ID
export function useFund(id: string) {
  return useQuery({
    queryKey: ["fund", id],
    queryFn: async (): Promise<Fund> => {
      const response = await fetch(`/api/funds/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch fund");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create fund
export function useCreateFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFundInput): Promise<Fund> => {
      const response = await fetch("/api/funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create fund");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FUNDS_QUERY_KEY });
    },
  });
}

// Update fund
export function useUpdateFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateFundInput;
    }): Promise<Fund> => {
      const response = await fetch(`/api/funds/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update fund");
      }

      return response.json();
    },
    onSuccess: (updatedFund) => {
      queryClient.invalidateQueries({ queryKey: FUNDS_QUERY_KEY });
      queryClient.invalidateQueries({ 
        queryKey: ["fund", updatedFund.id] 
      });
    },
  });
}

// Delete fund
export function useDeleteFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/funds/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete fund");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FUNDS_QUERY_KEY });
    },
  });
}

// Reorder funds
export function useReorderFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fundOrders: { id: string; order: number }[]): Promise<void> => {
      const response = await fetch("/api/funds/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fundOrders }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder funds");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FUNDS_QUERY_KEY });
    },
  });
}